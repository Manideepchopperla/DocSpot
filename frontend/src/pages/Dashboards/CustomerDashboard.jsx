// ✅ FRONTEND (React) - Booking Time Slot with Full Integration
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaHistory,
  FaUser,
  FaHome,
  FaSun,
} from "react-icons/fa";
import axios from "../../api/axios";
import { FiLogOut } from "react-icons/fi";

export default function PatientDashboard() {
  const [tab, setTab] = useState("doctors");
  const [search, setSearch] = useState("");
  const [upcoming, setUpcoming] = useState([]);
  const [profile, setProfile] = useState({ name: "", age: "", contact: "" });
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        const response = await axios.get("/appointments", {
          headers: {
            "x-auth-token": token,
          },
        });
        console.log("Upcoming appointments fetched:", response.data); 
        setUpcoming(response.data);
      } catch (error) {
        console.error("Error fetching upcoming appointments:", error);
      }
    };



    const fetchDoctors = async () => {
      try {
        const res = await axios.get("/doctors");
        setDoctors(res.data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };

    fetchUpcomingAppointments();
    fetchDoctors();
  }, []);
        const formattedDate=(date) =>{
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/auth/me", profile, {
        headers: {
          "x-auth-token": token,
        },
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleAppointmentBooking = async () => {
    if (!appointmentDate || !appointmentTime) return alert("Please select date and time.");
    try {
      const res = await axios.post(
        "/appointments",
        {
          doctor: selectedDoctor._id,
          date: appointmentDate,
          time: appointmentTime,
        },
        {
          headers: { "x-auth-token": token },
        }
      );
      alert("Appointment booked!");
      setAppointmentDate("");
      setAppointmentTime("");
      setSelectedDoctor(null);
    } catch (err) {
      console.error("Booking Error:", err);
      alert(err.response?.data?.msg || "Failed to book appointment");
    }
  };

  const filtered = upcoming.filter((u) =>
    u?.doctor?.user?.name?.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className="min-h-screen bg-slate-900 text-white transition-colors duration-300">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-800 shadow">
        <h1 className="text-2xl font-bold">Patient Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="text-yellow-400 hover:text-yellow-300"
        >
          <FiLogOut />
        </button>
      </header>

      <div className="p-6 flex flex-wrap gap-4 justify-center">
        {[
          { key: "doctors", label: "Doctors", icon: <FaSun /> },
          { key: "upcoming", label: "Upcoming", icon: <FaCalendarAlt /> },
          { key: "history", label: "History", icon: <FaHistory /> },
          { key: "profile", label: "Profile", icon: <FaUser /> },
          
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              tab === t.key
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 shadow text-indigo-400 hover:bg-slate-700"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 px-6 pb-6">
        <AnimatePresence mode="wait">
          {/* {tab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto bg-slate-800 rounded-xl p-6 text-center shadow"
            >
              <h2 className="text-2xl font-bold mb-2">Welcome to Your Dashboard</h2>
              <p className="text-gray-300">
                Manage your appointments and update your profile with ease.
              </p>
            </motion.div>
          )} */}
          {tab === "doctors" && (
            <motion.div
              key="doctors"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto bg-slate-800 rounded-xl p-6 shadow"
            >
              <h2 className="text-2xl font-bold mb-4">Available Doctors</h2>
              <ul className="space-y-3">
                {doctors.map((doc) => (
                  <li key={doc._id}>
                    <div
                      onClick={async () => {
                        if (selectedDoctor?._id === doc._id) {
                          setSelectedDoctor(null);
                          return;
                        }
                        try {
                          const res = await axios.get(`/doctors/${doc._id}`);
                          setSelectedDoctor(res.data);
                        } catch (err) {
                          console.error("Failed to fetch doctor details:", err);
                        }
                      }}
                      className="p-4 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition"
                    >
                      <p className="font-semibold text-indigo-300">{doc.user.name}</p>
                      <p className="text-sm text-gray-400">{doc.specialization}</p>
                    </div>

                    {selectedDoctor?._id === doc._id && (
                      <div className="mt-2 p-4 bg-slate-900 rounded-xl border border-indigo-600 text-left space-y-3">
                        <h3 className="text-xl font-bold text-indigo-400">Doctor Details</h3>
                        <p><strong>Name:</strong> {selectedDoctor.user.name}</p>
                        <p><strong>Email:</strong> {selectedDoctor.user.email}</p>
                        <p><strong>Phone:</strong> {selectedDoctor.user.phone}</p>
                        <p><strong>Specialization:</strong> {selectedDoctor.specialty}</p>

                        <input
                          type="date"
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          className="bg-slate-700 p-2 rounded text-white border border-slate-600"
                        />
                        <input
                          type="time"
                          value={appointmentTime}
                          onChange={(e) => setAppointmentTime(e.target.value)}
                          className="bg-slate-700 p-2 rounded text-white border border-slate-600"
                        />
                        <br/>
                        <button
                          onClick={handleAppointmentBooking}
                          className="mt-2 py-1 px-4 bg-indigo-600 rounded hover:bg-indigo-700"
                        >
                          Book Appointment
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {tab === "upcoming" && (
            <motion.div
              key="upcoming"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto bg-slate-800 rounded-xl p-6 shadow"
            >
              <input
                type="text"
                placeholder="Search doctor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2 mb-4 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
              />
              <ul className="space-y-2">
                {filtered.map((u) => (
                  <motion.li
                    key={u._id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-slate-700 border-l-4 border-indigo-500 rounded-xl flex justify-between"
                  >
                    <span className="font-semibold">{u.doctor?.user?.name || "Doctor"}</span>
                    <span className="text-gray-400">{formattedDate(u.date)}</span>
                    <span>{u.time}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {tab === "profile" && (
            <motion.form
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleProfileSubmit}
              className="bg-slate-800 p-8 rounded-xl shadow-xl max-w-md mx-auto mt-6"
            >
              <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
              {["name", "age", "contact"].map((key) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1 capitalize">
                    {key}
                  </label>
                  <input
                    type="text"
                    name={key}
                    value={profile[key]}
                    onChange={handleProfileChange}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Enter your ${key}`}
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-2 mt-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all"
              >
                Save Profile
              </button>
            </motion.form>
          )}

          {tab === "history" && (
            <motion.div
              key="history"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto bg-slate-800 rounded-xl p-6 text-center text-gray-400 mt-6 shadow"
            >
              <p>No history available yet.</p>
            </motion.div>
          )}
          {/* {tab === "doctors" && (
            <motion.div
              key="doctors"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto bg-slate-800 rounded-xl p-6 shadow"
            >
              <h2 className="text-2xl font-bold mb-4">Available Doctors</h2>
              <ul className="space-y-3">
                {doctors.map((doc) => (
                  <li key={doc._id}>
                    <div
                      onClick={async () => {
                        if (selectedDoctor?._id === doc._id) {
                          setSelectedDoctor(null);
                          return;
                        }
                        try {
                          const res = await axios.get(`/doctors/${doc._id}`);
                          setSelectedDoctor(res.data);
                        } catch (err) {
                          console.error("Failed to fetch doctor details:", err);
                        }
                      }}
                      className="p-4 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition"
                    >
                      <p className="font-semibold text-indigo-300">{doc.user.name}</p>
                      <p className="text-sm text-gray-400">{doc.specialization}</p>
                    </div>

                    {selectedDoctor?._id === doc._id && (
                      <div className="mt-2 p-4 bg-slate-900 rounded-xl border border-indigo-600 text-left space-y-3">
                        <h3 className="text-xl font-bold text-indigo-400">Doctor Details</h3>
                        <p><strong>Name:</strong> {selectedDoctor.user.name}</p>
                        <p><strong>Email:</strong> {selectedDoctor.user.email}</p>
                        <p><strong>Phone:</strong> {selectedDoctor.user.phone}</p>
                        <p><strong>Specialization:</strong> {selectedDoctor.specialty}</p>

                        <input
                          type="date"
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          className="bg-slate-700 p-2 rounded text-white border border-slate-600"
                        />
                        <input
                          type="time"
                          value={appointmentTime}
                          onChange={(e) => setAppointmentTime(e.target.value)}
                          className="bg-slate-700 p-2 rounded text-white border border-slate-600"
                        />
                        <br/>
                        <button
                          onClick={handleAppointmentBooking}
                          className="mt-2 py-1 px-4 bg-indigo-600 rounded hover:bg-indigo-700"
                        >
                          Book Appointment
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          )} */}
        </AnimatePresence>
      </div>
    </div>
  );
}
