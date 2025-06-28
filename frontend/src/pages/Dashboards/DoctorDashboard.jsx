import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import axios from '../../api/axios'; // Import the Axios instance

export default function DoctorDashboard() {
  const [tab, setTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialty: '',
    qualifications: '',
    experience: '',
    consultationFee: '',
    bio: ''
  });

  const token = localStorage.getItem('token'); // Get token from local storage

  const tabs = ["appointments", "profile"];

  const formattedDate=(date) =>{
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('/appointments', {
          headers: {
            'x-auth-token': token,
          }
        });
        setAppointments(response.data.filter(a => a.status != 'pending'));
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await axios.get("/auth/me", {
          headers: {
            "x-auth-token": token,
          },
        });
        console.log("Profile fetched:", res.data);

        const { user, doctor } = res.data;

        setProfile({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          address: user?.address || '',
          specialty: doctor?.specialty || '',
          qualifications: (doctor?.qualifications || []).join(', '),
          experience: doctor?.experience || '',
          consultationFee: doctor?.consultationFee || '',
          bio: doctor?.bio || ''
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };


    fetchAppointments();
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const updatedProfile = {
      ...profile,
      name: profile.name.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      specialty: profile.specialty.trim(),
      bio: profile.bio.trim(),
      experience: Number(profile.experience),
      consultationFee: Number(profile.consultationFee),
      qualifications: profile.qualifications
        .split(',')
        .map(q => q.trim())
        .filter(q => q)
    };

    try {
      await axios.put('/auth/doctors/me', updatedProfile, {
        headers: {
          'x-auth-token': token,
        }
      });
      await axios.put('/auth/users/me', updatedProfile, {
        headers: {
          'x-auth-token': token,
        }
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };


  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col transition-colors duration-300">
      <Header
        title="Doctor Dashboard"
        onProfileClick={() => alert("Edit Profile")}
      />

      {/* Tabs */}
      <div className="p-6 flex gap-4 flex-wrap justify-center">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
              tab === t
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-emerald-400 hover:bg-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-6 pb-6">
        <AnimatePresence mode="wait">
          {tab === "appointments" && (
            <motion.div
              key="appointments"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto bg-slate-800 p-6 rounded-xl shadow"
            >
              <h3 className="text-xl font-bold mb-4">Appointments</h3>
              <ul className="space-y-2">
                {appointments.map((a, idx) => (
                  <motion.li
                    key={a._id || idx}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-slate-700 rounded-xl flex justify-between text-gray-300 bg-slate-700 border-l-4 border-indigo-500 rounded-xl "
                  >
                    <span className="font-semibold text-white">{a.patient?.name || "Unknown"}</span>
                    <span className="text-gray-400">{formattedDate(a.date)}</span>
                    <span>{a.time}</span>
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
              className="bg-slate-800 p-8 rounded-xl shadow max-w-md mx-auto mt-6"
              onSubmit={handleProfileSubmit}
            >
              <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>

              {/* User fields */}
              {["name", "email", "phone","address"].map((key) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1 capitalize">
                    {key}
                  </label>
                  <input
                    type="text"
                    name={key}
                    value={profile[key] || ""}
                    onChange={handleProfileChange}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
                    placeholder={`Enter your ${key}`}
                  />
                </div>
              ))}

              {/* Specialty dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Specialty
                </label>
                <select
                  name="specialty"
                  value={profile.specialty || ""}
                  onChange={handleProfileChange}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="" disabled>Select your specialty</option>
                  {["Cardiology", "Dermatology", "Neurology", "Pediatrics", "Orthopedics"].map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor fields (number inputs) */}
              {["experience", "consultationFee"].map((key) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1 capitalize">
                    {key === "consultationFee" ? "Consultation Fee (₹)" : key}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={profile[key] || ""}
                    onChange={handleProfileChange}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
                    placeholder={`Enter your ${key}`}
                  />
                </div>
              ))}

              {/* Qualifications */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Qualifications (comma separated)
                </label>
                <input
                  type="text"
                  name="qualifications"
                  value={profile.qualifications || ""}
                  onChange={handleProfileChange}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. MBBS, MD"
                />
              </div>

              {/* Bio */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio || ""}
                  onChange={handleProfileChange}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
                  rows={4}
                  placeholder="Write about yourself"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-all"
              >
                Save Profile
              </button>
            </motion.form>
          )}



          {/* {tab === "patients" && (
            <motion.div
              key="patients"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto bg-slate-800 p-6 rounded-xl shadow text-center mt-6 text-gray-400"
            >
              <p>No patient data available.</p>
            </motion.div>
          )} */}
        </AnimatePresence>
      </div>
    </div>
  );
}
