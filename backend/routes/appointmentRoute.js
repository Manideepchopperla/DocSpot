  const express = require('express');
  const router = express.Router();
  const { check, validationResult } = require('express-validator');
  const auth = require('../middlewares/auth');
  const Appointment = require('../models/appointmentModel');
  const Doctor = require('../models/docModel');
  const User = require('../models/userModel');

// @route   POST api/appointments
// @desc    Create a new appointment
// @access  Private
router.post('/', [auth, [
    check('doctor', 'Doctor is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('time', 'Time is required').not().isEmpty()
  ]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { doctor, date, time } = req.body;

      // Check if doctor exists and is approved
      const doctorExists = await Doctor.findOne({ _id: doctor, isApproved: true });
      if (!doctorExists) {
        return res.status(404).json({ msg: 'Doctor not found or not approved' });
      }

      // Check slot conflict
      const appointmentDate = new Date(date);
      const existingAppointment = await Appointment.findOne({
        doctor,
        date: {
          $gte: new Date(appointmentDate.setHours(0, 0, 0)),
          $lt: new Date(appointmentDate.setHours(23, 59, 59))
        },
        time,
        status: { $in: ['pending', 'confirmed'] }
      });

      if (existingAppointment) {
        return res.status(400).json({ msg: 'This time slot is already booked' });
      }

      // Create appointment
      const appointment = new Appointment({
        patient: req.user.id,
        doctor,
        date,
        time,
        status: 'pending'
      });

      await appointment.save();
      res.json(appointment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});


  // @route   GET api/appointments
  // @desc    Get all appointments for the logged in user (patient or doctor)
  // @access  Private
  router.get('/', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      
      let appointments;
      
      if (user.role === 'doctor') {
        const doctor = await Doctor.findOne({ user: req.user.id });
        
        if (!doctor) {
          return res.status(404).json({ msg: 'Doctor profile not found' });
        }
        
        appointments = await Appointment.find({ doctor: doctor._id })
          .populate('patient', ['name', 'email', 'phone'])
          .sort({ date: 1 });
      } else {
        appointments = await Appointment.find({ patient: req.user.id })
          .populate({
            path: 'doctor',
            populate: {
              path: 'user',
              select: 'name email phone'
            }
          })
          .sort({ date: 1 });
      }
      
      res.json(appointments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  // @route   PUT api/appointments/:id
  // @desc    Update appointment status
  // @access  Private
  router.put('/:id', auth, async (req, res) => {
    try {
      const { status, prescription, notes } = req.body;
      const appointment = await Appointment.findById(req.params.id);
      
      if (!appointment) {
        return res.status(404).json({ msg: 'Appointment not found' });
      }
      
      // Verify ownership or doctor status
      const user = await User.findById(req.user.id);
      const isDoctor = user.role === 'doctor';
      const isPatient = appointment.patient.toString() === req.user.id;
      
      if (isDoctor) {
        const doctor = await Doctor.findOne({ user: req.user.id });
        if (!doctor || doctor._id.toString() !== appointment.doctor.toString()) {
          return res.status(401).json({ msg: 'Not authorized' });
        }
      } else if (!isPatient) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
      
      // Update appointment
      if (status) appointment.status = status;
      if (prescription && isDoctor) appointment.prescription = prescription;
      if (notes) appointment.notes = notes;
      
      await appointment.save();
      
      res.json(appointment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  // @route   GET api/appointments/available/:doctorId/:date
  // @desc    Get available time slots for a doctor on a specific date
  // @access  Private
  router.get('/available/:doctorId/:date', auth, async (req, res) => {
    try {
      const { doctorId, date } = req.params;
      
      // Get doctor's available time slots
      const doctor = await Doctor.findById(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ msg: 'Doctor not found' });
      }
      
      const availableTimeSlots = doctor.availableTimeSlots;
      
      // Get booked appointments for the date
      const appointmentDate = new Date(date);
      const bookedAppointments = await Appointment.find({
        doctor: doctorId,
        date: {
          $gte: new Date(appointmentDate.setHours(0, 0, 0)),
          $lt: new Date(appointmentDate.setHours(23, 59, 59))
        },
        status: { $in: ['pending', 'confirmed'] }
      }).select('timeSlot');
      
      // Filter out booked time slots
      const bookedTimeSlots = bookedAppointments.map(app => app.timeSlot);
      const availableSlots = availableTimeSlots.filter(slot => 
        !bookedTimeSlots.some(bookedSlot => 
          bookedSlot.start === slot.start && bookedSlot.end === slot.end
        )
      );
      
      res.json(availableSlots);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  module.exports = router;