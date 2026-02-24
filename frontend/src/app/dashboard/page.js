"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "../../lib/api";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "doctors", label: "Doctors" },
  { id: "patients", label: "Patients" },
  { id: "schedules", label: "OT Schedules" },
  { id: "reports", label: "Reports" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    schedules: 0,
    reports: 0,
  });
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState("");

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [reports, setReports] = useState([]);

  const [doctorActionLoading, setDoctorActionLoading] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialization: "",
    role: "Surgeon",
  });

  const [patientActionLoading, setPatientActionLoading] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "male",
    diagnosis: "",
    contact: "",
  });
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [editPatient, setEditPatient] = useState({
    name: "",
    age: "",
    gender: "male",
    diagnosis: "",
    contact: "",
  });

  const [scheduleActionLoading, setScheduleActionLoading] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    date: "",
    otNumber: "",
    anesthesiaType: "",
    patientId: "",
    surgeonId: "",
    anesthesiologistId: "",
    assistantSurgeonId: "",
    nurses: "",
    drugs: "",
    instruments: "",
    materials: "",
  });
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [editSchedule, setEditSchedule] = useState({
    date: "",
    otNumber: "",
    anesthesiaType: "",
    patientId: "",
    surgeonId: "",
    anesthesiologistId: "",
    assistantSurgeonId: "",
    nurses: "",
    drugs: "",
    instruments: "",
    materials: "",
  });

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const storedName = typeof window !== "undefined" ? localStorage.getItem("name") : "";
    const storedRole = typeof window !== "undefined" ? localStorage.getItem("role") : "";

    if (!token) {
      router.replace("/");
      return;
    }

    // Only admins are allowed to access the main dashboard
    if (storedRole !== "admin") {
      router.replace("/user");
      return;
    }

    setUserName(storedName || "");
    setRole(storedRole || "");
    fetchOverview();
  }, [router]);

  const safeGet = async (path) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/");
      return null;
    }

    try {
      const { data } = await api.get(path);
      return data;
    } catch (err) {
      if (err?.response?.status === 401) {
        if (typeof window !== "undefined") localStorage.clear();
        router.replace("/");
        return null;
      }
      throw err;
    }
  };

  const safePost = async (path, body) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/");
      return null;
    }

    try {
      const { data } = await api.post(path, body);
      return data;
    } catch (err) {
      if (err?.response?.status === 401) {
        if (typeof window !== "undefined") localStorage.clear();
        router.replace("/");
        return null;
      }
      throw err;
    }
  };

  const safeDelete = async (path) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/");
      return null;
    }

    try {
      const { data } = await api.delete(path);
      return data;
    } catch (err) {
      if (err?.response?.status === 401) {
        if (typeof window !== "undefined") localStorage.clear();
        router.replace("/");
        return null;
      }
      throw err;
    }
  };

  const safePut = async (path, body) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/");
      return null;
    }

    try {
      const { data } = await api.put(path, body);
      return data;
    } catch (err) {
      if (err?.response?.status === 401) {
        if (typeof window !== "undefined") localStorage.clear();
        router.replace("/");
        return null;
      }
      throw err;
    }
  };

  const safePatch = async (path, body) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/");
      return null;
    }

    try {
      const { data } = await api.patch(path, body);
      return data;
    } catch (err) {
      if (err?.response?.status === 401) {
        if (typeof window !== "undefined") localStorage.clear();
        router.replace("/");
        return null;
      }
      throw err;
    }
  };

  const fetchOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const [doctorData, patientData, scheduleData] = await Promise.all([
        safeGet("/doctor/getAll"),
        safeGet("/patient/getAll"),
        safeGet("/otschedule/getAll"),
      ]);

      setStats({
        doctors:
          doctorData?.count ?? doctorData?.doctors?.length ?? doctorData?.length ?? 0,
        patients:
          patientData?.count ?? patientData?.patients?.length ?? patientData?.length ?? 0,
        schedules:
          scheduleData?.count ?? scheduleData?.schedules?.length ?? scheduleData?.length ?? 0,
        reports: 0,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load overview"));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (id) => {
    setActiveTab(id);
    if (id === "doctors") {
      await loadDoctors();
    } else if (id === "patients") {
      await loadPatients();
    } else if (id === "schedules") {
      await Promise.all([loadSchedules(), loadDoctors(), loadPatients()]);
    }
  };

  const loadDoctors = async () => {
    setListLoading(true);
    setError("");
    try {
      const data = await safeGet("/doctor/getAll");
      if (data?.doctors && Array.isArray(data.doctors)) {
        setDoctors(data.doctors);
      } else if (Array.isArray(data)) {
        setDoctors(data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load doctors"));
    } finally {
      setListLoading(false);
    }
  };

  const loadPatients = async () => {
    setListLoading(true);
    setError("");
    try {
      const data = await safeGet("/patient/getAll");
      if (data?.patients && Array.isArray(data.patients)) {
        setPatients(data.patients);
      } else if (Array.isArray(data)) {
        setPatients(data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load patients"));
    } finally {
      setListLoading(false);
    }
  };

  const loadSchedules = async () => {
    setListLoading(true);
    setError("");
    try {
      const data = await safeGet("/otschedule/getAll");
      if (data?.schedules && Array.isArray(data.schedules)) {
        setSchedules(data.schedules);
      } else if (Array.isArray(data)) {
        setSchedules(data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load OT schedules"));
    } finally {
      setListLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    router.replace("/");
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setError("");

    if (!newDoctor.name.trim()) {
      setError("Doctor name is required");
      return;
    }

    setDoctorActionLoading(true);
    try {
      const payload = {
        name: newDoctor.name.trim(),
        specialization: newDoctor.specialization.trim() || undefined,
        role: newDoctor.role,
      };
      const result = await safePost("/doctor/add", payload);
      if (result?.success) {
        setNewDoctor({
          name: "",
          specialization: "",
          role: "Surgeon",
        });
        await loadDoctors();
        await fetchOverview();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to add doctor"));
    } finally {
      setDoctorActionLoading(false);
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!id) return;
    // eslint-disable-next-line no-alert
    const confirmed = typeof window !== "undefined" ? window.confirm("Delete this doctor?") : false;
    if (!confirmed) return;

    setDoctorActionLoading(true);
    setError("");
    try {
      await safeDelete(`/doctor/delete/${id}`);
      setDoctors((prev) => prev.filter((d) => d._id !== id));
      await fetchOverview();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete doctor"));
    } finally {
      setDoctorActionLoading(false);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPatient.name.trim() || !newPatient.age || !newPatient.contact.trim()) {
      setError("Name, age and contact are required for a patient");
      return;
    }

    setPatientActionLoading(true);
    try {
      const payload = {
        name: newPatient.name.trim(),
        age: Number(newPatient.age),
        gender: newPatient.gender,
        diagnosis: newPatient.diagnosis.trim() || undefined,
        contact: newPatient.contact.trim(),
      };
      const result = await safePost("/patient/add", payload);
      if (result?.success) {
        setNewPatient({
          name: "",
          age: "",
          gender: "male",
          diagnosis: "",
          contact: "",
        });
        await loadPatients();
        await fetchOverview();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to add patient"));
    } finally {
      setPatientActionLoading(false);
    }
  };

  const startEditPatient = (patient) => {
    if (!patient?._id) return;
    setEditingPatientId(patient._id);
    setEditPatient({
      name: patient.name || "",
      age: patient.age != null ? String(patient.age) : "",
      gender: patient.gender || "male",
      diagnosis: patient.diagnosis || "",
      contact: patient.contact || "",
    });
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    if (!editingPatientId) return;

    setError("");
    if (!editPatient.name.trim() || !editPatient.age || !editPatient.contact.trim()) {
      setError("Name, age and contact are required for a patient");
      return;
    }

    setPatientActionLoading(true);
    try {
      const updates = {
        name: editPatient.name.trim(),
        age: Number(editPatient.age),
        gender: editPatient.gender,
        diagnosis: editPatient.diagnosis.trim() || undefined,
        contact: editPatient.contact.trim(),
      };
      const result = await safePut(`/patient/update/${editingPatientId}`, {
        updates,
      });
      if (result?.success) {
        setEditingPatientId(null);
        await loadPatients();
        await fetchOverview();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update patient"));
    } finally {
      setPatientActionLoading(false);
    }
  };

  const handleCancelEditPatient = () => {
    setEditingPatientId(null);
    setEditPatient({
      name: "",
      age: "",
      gender: "male",
      diagnosis: "",
      contact: "",
    });
  };

  const handleDeletePatient = async (id) => {
    if (!id) return;
    // eslint-disable-next-line no-alert
    const confirmed =
      typeof window !== "undefined"
        ? window.confirm("Delete this patient?")
        : false;
    if (!confirmed) return;

    setPatientActionLoading(true);
    setError("");
    try {
      await safeDelete(`/patient/delete/${id}`);
      setPatients((prev) => prev.filter((p) => p._id !== id));
      await fetchOverview();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete patient"));
    } finally {
      setPatientActionLoading(false);
    }
  };

  const toDateTimeLocal = (value) => {
    if (!value) return "";
    const d = new Date(value);
    const pad = (n) => `${n}`.padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getId = (field) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field._id || "";
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !newSchedule.date ||
      !newSchedule.otNumber ||
      !newSchedule.patientId ||
      !newSchedule.surgeonId ||
      !newSchedule.anesthesiologistId ||
      !newSchedule.anesthesiaType.trim()
    ) {
      setError(
        "Date, OT number, patient, surgeon, anesthesiologist and anesthesia type are required"
      );
      return;
    }

    const splitList = (str) =>
      str
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    setScheduleActionLoading(true);
    try {
      const payload = {
        date: newSchedule.date,
        otNumber: Number(newSchedule.otNumber),
        anesthesiaType: newSchedule.anesthesiaType.trim(),
        patient: newSchedule.patientId,
        surgeon: newSchedule.surgeonId,
        anesthesiologist: newSchedule.anesthesiologistId,
        assistantSurgeon: newSchedule.assistantSurgeonId || undefined,
        nurses: newSchedule.nurses ? splitList(newSchedule.nurses) : undefined,
        requiredResources: {
          drugs: newSchedule.drugs ? splitList(newSchedule.drugs) : undefined,
          instruments: newSchedule.instruments
            ? splitList(newSchedule.instruments)
            : undefined,
          materials: newSchedule.materials
            ? splitList(newSchedule.materials)
            : undefined,
        },
      };

      const result = await safePost("/otschedule/add", payload);
      if (result?.success) {
        setNewSchedule({
          date: "",
          otNumber: "",
          anesthesiaType: "",
          patientId: "",
          surgeonId: "",
          anesthesiologistId: "",
          assistantSurgeonId: "",
          nurses: "",
          drugs: "",
          instruments: "",
          materials: "",
        });
        await loadSchedules();
        await fetchOverview();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create OT schedule"));
    } finally {
      setScheduleActionLoading(false);
    }
  };

  const startEditSchedule = (schedule) => {
    if (!schedule?._id) return;

    setEditingScheduleId(schedule._id);
    setEditSchedule({
      date: toDateTimeLocal(schedule.date),
      otNumber: schedule.otNumber != null ? String(schedule.otNumber) : "",
      anesthesiaType: schedule.anesthesiaType || "",
      patientId: getId(schedule.patient),
      surgeonId: getId(schedule.surgeon),
      anesthesiologistId: getId(schedule.anesthesiologist),
      assistantSurgeonId: getId(schedule.assistantSurgeon),
      nurses: Array.isArray(schedule.nurses)
        ? schedule.nurses.join(", ")
        : "",
      drugs: Array.isArray(schedule.requiredResources?.drugs)
        ? schedule.requiredResources.drugs.join(", ")
        : "",
      instruments: Array.isArray(schedule.requiredResources?.instruments)
        ? schedule.requiredResources.instruments.join(", ")
        : "",
      materials: Array.isArray(schedule.requiredResources?.materials)
        ? schedule.requiredResources.materials.join(", ")
        : "",
    });
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    if (!editingScheduleId) return;

    setError("");
    if (
      !editSchedule.date ||
      !editSchedule.otNumber ||
      !editSchedule.patientId ||
      !editSchedule.surgeonId ||
      !editSchedule.anesthesiologistId ||
      !editSchedule.anesthesiaType.trim()
    ) {
      setError(
        "Date, OT number, patient, surgeon, anesthesiologist and anesthesia type are required"
      );
      return;
    }

    const splitList = (str) =>
      str
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    setScheduleActionLoading(true);
    try {
      const updates = {
        date: editSchedule.date,
        otNumber: Number(editSchedule.otNumber),
        anesthesiaType: editSchedule.anesthesiaType.trim(),
        patient: editSchedule.patientId,
        surgeon: editSchedule.surgeonId,
        anesthesiologist: editSchedule.anesthesiologistId,
        assistantSurgeon: editSchedule.assistantSurgeonId || undefined,
        nurses: editSchedule.nurses ? splitList(editSchedule.nurses) : undefined,
        requiredResources: {
          drugs: editSchedule.drugs ? splitList(editSchedule.drugs) : undefined,
          instruments: editSchedule.instruments
            ? splitList(editSchedule.instruments)
            : undefined,
          materials: editSchedule.materials
            ? splitList(editSchedule.materials)
            : undefined,
        },
      };

      const result = await safePut(
        `/otschedule/update/${editingScheduleId}`,
        updates
      );
      if (result?.success) {
        setEditingScheduleId(null);
        await loadSchedules();
        await fetchOverview();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update OT schedule"));
    } finally {
      setScheduleActionLoading(false);
    }
  };

  const handleCancelEditSchedule = () => {
    setEditingScheduleId(null);
    setEditSchedule({
      date: "",
      otNumber: "",
      anesthesiaType: "",
      patientId: "",
      surgeonId: "",
      anesthesiologistId: "",
      assistantSurgeonId: "",
      nurses: "",
      drugs: "",
      instruments: "",
      materials: "",
    });
  };

  const handleCancelSchedule = async (id) => {
    if (!id) return;
    // eslint-disable-next-line no-alert
    const confirmed =
      typeof window !== "undefined"
        ? window.confirm("Cancel this OT schedule?")
        : false;
    if (!confirmed) return;

    setScheduleActionLoading(true);
    setError("");
    try {
      await safePatch(`/otschedule/${id}/cancel`);
      await loadSchedules();
      await fetchOverview();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to cancel OT schedule"));
    } finally {
      setScheduleActionLoading(false);
    }
  };

  const handleCompleteSchedule = async (schedule) => {
    if (!schedule?._id) return;

    let postOpNotes = "";
    let remarks = "";

    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-alert
      postOpNotes =
        window.prompt("Post-op notes (optional)", schedule.postOpNotes || "") ||
        "";
      // eslint-disable-next-line no-alert
      remarks =
        window.prompt("Remarks (optional)", schedule.remarks || "") || "";
    }

    setScheduleActionLoading(true);
    setError("");
    try {
      await safePatch(`/otschedule/${schedule._id}/complete`, {
        postOpNotes,
        remarks,
      });
      await loadSchedules();
      await fetchOverview();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to complete OT schedule"));
    } finally {
      setScheduleActionLoading(false);
    }
  };

  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-semibold">
              OT
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Hospital OT Management
              </p>
              <p className="text-xs text-slate-500">
                {isAdmin ? "Admin" : "User"} dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-500">Signed in as</p>
              <p className="text-sm font-medium text-slate-800">
                {userName || "User"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <nav className="flex gap-2 rounded-xl bg-white p-1 shadow-sm border border-slate-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {activeTab === "overview" && (
          <section>
            {loading ? (
              <p className="text-sm text-slate-500">Loading overview...</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Doctors"
                  value={stats.doctors}
                  accent="from-sky-500/15 via-sky-400/10 to-sky-300/10"
                />
                <StatCard
                  label="Patients"
                  value={stats.patients}
                  accent="from-emerald-500/15 via-emerald-400/10 to-emerald-300/10"
                />
                <StatCard
                  label="OT Schedules"
                  value={stats.schedules}
                  accent="from-indigo-500/15 via-indigo-400/10 to-indigo-300/10"
                />
                <StatCard
                  label="Reports"
                  value={stats.reports}
                  accent="from-amber-500/15 via-amber-400/10 to-amber-300/10"
                />
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-700">
              Tip: Use the tabs above to browse detailed lists of doctors,
              patients and OT schedules. This frontend is aligned with your
              existing REST API.
            </div>
          </section>
        )}

        {activeTab === "doctors" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Doctors</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Manage registered surgeons and anesthesiologists.
                </p>
              </div>

              <form
                onSubmit={handleAddDoctor}
                className="flex flex-col gap-2 sm:flex-row sm:items-end"
              >
                <div className="flex-1 min-w-35">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newDoctor.name}
                    onChange={(e) =>
                      setNewDoctor((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div className="flex-1 min-w-35">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={newDoctor.specialization}
                    onChange={(e) =>
                      setNewDoctor((prev) => ({
                        ...prev,
                        specialization: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    placeholder="Orthopedic, Neuro, Cardiac..."
                  />
                </div>
                <div className="min-w-35">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Role
                  </label>
                  <select
                    value={newDoctor.role}
                    onChange={(e) =>
                      setNewDoctor((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                  >
                    <option value="Surgeon">Surgeon</option>
                    <option value="Anesthesiologist">Anesthesiologist</option>
                    <option value="Assistant Surgeon">Assistant Surgeon</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={doctorActionLoading}
                  className="mt-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 disabled:opacity-70 disabled:cursor-not-allowed sm:mt-0"
                >
                  {doctorActionLoading ? "Saving..." : "Add doctor"}
                </button>
              </form>
            </div>

            {listLoading ? (
              <p className="text-sm text-slate-500">Loading doctors...</p>
            ) : doctors.length === 0 ? (
              <p className="text-sm text-slate-500">
                No doctors found. Use the form above to add doctors.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Specialization</th>
                      <th className="px-3 py-2 font-medium">Role</th>
                      <th className="px-3 py-2 font-medium">Created at</th>
                      <th className="px-3 py-2 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((d) => (
                      <tr
                        key={d._id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
                      >
                        <td className="px-3 py-2 text-slate-700">{d.name}</td>
                        <td className="px-3 py-2 text-slate-700">
                          {d.specialization || "—"}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {d.role || "—"}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {d.createdAt
                            ? new Date(d.createdAt).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteDoctor(d._id)}
                            disabled={doctorActionLoading}
                            className="inline-flex items-center rounded-full border border-red-200 px-3 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === "patients" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Patients</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Manage patients scheduled for OT.
                </p>
              </div>

              <form
                onSubmit={handleAddPatient}
                className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
              >
                <div className="flex-1 min-w-30">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newPatient.name}
                    onChange={(e) =>
                      setNewPatient((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    placeholder="Patient name"
                  />
                </div>
                <div className="min-w-22.5">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Age
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPatient.age}
                    onChange={(e) =>
                      setNewPatient((prev) => ({
                        ...prev,
                        age: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    placeholder="Age"
                  />
                </div>
                <div className="min-w-27.5">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Gender
                  </label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) =>
                      setNewPatient((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="flex-1 min-w-35">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Diagnosis
                  </label>
                  <input
                    type="text"
                    value={newPatient.diagnosis}
                    onChange={(e) =>
                      setNewPatient((prev) => ({
                        ...prev,
                        diagnosis: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    placeholder="Optional diagnosis"
                  />
                </div>
                <div className="flex-1 min-w-37.5">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={newPatient.contact}
                    onChange={(e) =>
                      setNewPatient((prev) => ({
                        ...prev,
                        contact: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    placeholder="Phone / contact"
                  />
                </div>
                <button
                  type="submit"
                  disabled={patientActionLoading}
                  className="mt-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 disabled:opacity-70 disabled:cursor-not-allowed sm:mt-0"
                >
                  {patientActionLoading ? "Saving..." : "Add patient"}
                </button>
              </form>
            </div>

            {listLoading ? (
              <p className="text-sm text-slate-500">Loading patients...</p>
            ) : patients.length === 0 ? (
              <p className="text-sm text-slate-500">
                No patients found. Use the form above to add patients.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Age</th>
                      <th className="px-3 py-2 font-medium">Gender</th>
                      <th className="px-3 py-2 font-medium">Diagnosis</th>
                      <th className="px-3 py-2 font-medium">Contact</th>
                      <th className="px-3 py-2 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr
                        key={p._id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
                      >
                        <td className="px-3 py-2 text-slate-700">{p.name}</td>
                        <td className="px-3 py-2 text-slate-700">{p.age}</td>
                        <td className="px-3 py-2 text-slate-700">
                          {p.gender || "—"}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {p.diagnosis || "—"}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {p.contact || "—"}
                        </td>
                        <td className="px-3 py-2 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => startEditPatient(p)}
                            className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePatient(p._id)}
                            disabled={patientActionLoading}
                            className="inline-flex items-center rounded-full border border-red-200 px-3 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {editingPatientId && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="mb-2 text-xs font-semibold text-slate-700">
                  Edit patient
                </p>
                <form
                  onSubmit={handleUpdatePatient}
                  className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
                >
                  <div className="flex-1 min-w-30">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editPatient.name}
                      onChange={(e) =>
                        setEditPatient((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    />
                  </div>
                  <div className="min-w-22.5">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Age
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editPatient.age}
                      onChange={(e) =>
                        setEditPatient((prev) => ({
                          ...prev,
                          age: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    />
                  </div>
                  <div className="min-w-27.5">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Gender
                    </label>
                    <select
                      value={editPatient.gender}
                      onChange={(e) =>
                        setEditPatient((prev) => ({
                          ...prev,
                          gender: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-35">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Diagnosis
                    </label>
                    <input
                      type="text"
                      value={editPatient.diagnosis}
                      onChange={(e) =>
                        setEditPatient((prev) => ({
                          ...prev,
                          diagnosis: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex-1 min-w-37.5">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Contact
                    </label>
                    <input
                      type="text"
                      value={editPatient.contact}
                      onChange={(e) =>
                        setEditPatient((prev) => ({
                          ...prev,
                          contact: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={patientActionLoading}
                      className="mt-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 disabled:opacity-70 disabled:cursor-not-allowed sm:mt-0"
                    >
                      {patientActionLoading ? "Saving..." : "Update patient"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditPatient}
                      className="mt-1 inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 sm:mt-0"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}

        {activeTab === "schedules" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  OT Schedules
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Create and manage operation theatre schedules.
                </p>
              </div>

              <form
                onSubmit={handleAddSchedule}
                className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-end"
              >
                <div className="min-w-42.5">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Date &amp; time
                  </label>
                  <input
                    type="datetime-local"
                    value={newSchedule.date}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                  />
                </div>
                <div className="min-w-22.5">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    OT #
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSchedule.otNumber}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        otNumber: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    placeholder="1"
                  />
                </div>
                <div className="min-w-35">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Patient
                  </label>
                  <select
                    value={newSchedule.patientId}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        patientId: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                  >
                    <option value="">Select patient</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-37.5">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Surgeon
                  </label>
                  <select
                    value={newSchedule.surgeonId}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        surgeonId: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                  >
                    <option value="">Select surgeon</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} {d.role ? `(${d.role})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w
                -42.5">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Anesthesiologist
                  </label>
                  <select
                    value={newSchedule.anesthesiologistId}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        anesthesiologistId: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                  >
                    <option value="">Select anesthesiologist</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} {d.role ? `(${d.role})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-42.5">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Anesthesia type
                  </label>
                  <input
                    type="text"
                    value={newSchedule.anesthesiaType}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        anesthesiaType: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    placeholder="General, spinal, epidural..."
                  />
                </div>
                <div className="min-w-42.5">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Assistant surgeon(s)
                  </label>
                  <select
                    value={newSchedule.assistantSurgeonId}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        assistantSurgeonId: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                  >
                    <option value="">Optional</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} {d.role ? `(${d.role})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-42.5">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Nurses (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newSchedule.nurses}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        nurses: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    placeholder="Nurse A, Nurse B"
                  />
                </div>
                <button
                  type="submit"
                  disabled={scheduleActionLoading}
                  className="mt-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 disabled:opacity-70 disabled:cursor-not-allowed lg:mt-0"
                >
                  {scheduleActionLoading ? "Saving..." : "Add schedule"}
                </button>
              </form>
            </div>

            {listLoading ? (
              <p className="text-sm text-slate-500">Loading OT schedules...</p>
            ) : schedules.length === 0 ? (
              <p className="text-sm text-slate-500">
                No OT schedules found. Use the form above to create one.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">OT #</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Anesthesia</th>
                      <th className="px-3 py-2 font-medium">Patient</th>
                      <th className="px-3 py-2 font-medium">Surgeon</th>
                      <th className="px-3 py-2 font-medium">Anesthesiologist</th>
                      <th className="px-3 py-2 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s) => (
                      <tr
                        key={s._id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
                      >
                        <td className="px-3 py-2 text-slate-700">
                          {s.date ? new Date(s.date).toLocaleString() : "—"}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {s.otNumber}
                        </td>
                        <td className="px-3 py-2 text-slate-700">{s.status}</td>
                        <td className="px-3 py-2 text-slate-700">
                          {s.anesthesiaType}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {typeof s.patient === "object"
                            ? s.patient?.name
                            : s.patient}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {typeof s.surgeon === "object"
                            ? s.surgeon?.name
                            : s.surgeon || "—"}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {typeof s.anesthesiologist === "object"
                            ? s.anesthesiologist?.name
                            : s.anesthesiologist || "—"}
                        </td>
                        <td className="px-3 py-2 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => startEditSchedule(s)}
                            className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCompleteSchedule(s)}
                            disabled={scheduleActionLoading}
                            className="inline-flex items-center rounded-full border border-emerald-200 px-3 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                          >
                            Mark completed
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelSchedule(s._id)}
                            disabled={scheduleActionLoading}
                            className="inline-flex items-center rounded-full border border-red-200 px-3 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {editingScheduleId && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="mb-2 text-xs font-semibold text-slate-700">
                  Edit OT schedule
                </p>
                <form
                  onSubmit={handleUpdateSchedule}
                  className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-end"
                >
                  <div className="min-w-42.5">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Date &amp; time
                    </label>
                    <input
                      type="datetime-local"
                      value={editSchedule.date}
                      onChange={(e) =>
                        setEditSchedule((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    />
                  </div>
                  <div className="min-w-22.5">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      OT #
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editSchedule.otNumber}
                      onChange={(e) =>
                        setEditSchedule((prev) => ({
                          ...prev,
                          otNumber: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    />
                  </div>
                  <div className="min-w-35">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Patient
                    </label>
                    <select
                      value={editSchedule.patientId}
                      onChange={(e) =>
                        setEditSchedule((prev) => ({
                          ...prev,
                          patientId: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    >
                      <option value="">Select patient</option>
                      {patients.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-37.5">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Surgeon
                    </label>
                    <select
                      value={editSchedule.surgeonId}
                      onChange={(e) =>
                        setEditSchedule((prev) => ({
                          ...prev,
                          surgeonId: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    >
                      <option value="">Select surgeon</option>
                      {doctors.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} {d.role ? `(${d.role})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-42.5">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Anesthesiologist
                    </label>
                    <select
                      value={editSchedule.anesthesiologistId}
                      onChange={(e) =>
                        setEditSchedule((prev) => ({
                          ...prev,
                          anesthesiologistId: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    >
                      <option value="">Select anesthesiologist</option>
                      {doctors.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} {d.role ? `(${d.role})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-42.5">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Anesthesia type
                    </label>
                    <input
                      type="text"
                      value={editSchedule.anesthesiaType}
                      onChange={(e) =>
                        setEditSchedule((prev) => ({
                          ...prev,
                          anesthesiaType: e.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    />
                  </div>
                  <div className="min-w-42.5">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Nurses (comma separated)
                    </label>
                    <input
                      type="text"
                      value={editSchedule.nurses}
                      onChange={(e) =>
                        setEditSchedule((prev) => ({
                          ...prev,
                          nurses: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    />
                  </div>
                  <div className="min-w-42.5">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Drugs (comma separated)
                    </label>
                    <input
                      type="text"
                      value={editSchedule.drugs}
                      onChange={(e) =>
                        setEditSchedule((prev) => ({
                          ...prev,
                          drugs: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    />
                  </div>
                  <div className="min-w-42.5">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Instruments (comma separated)
                    </label>
                    <input
                      type="text"
                      value={editSchedule.instruments}
                      onChange={(e) =>
                        setEditSchedule((prev) => ({
                          ...prev,
                          instruments: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    />
                  </div>
                  <div className="min-w-42.5">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Materials (comma separated)
                    </label>
                    <input
                      type="text"
                      value={editSchedule.materials}
                      onChange={(e) =>
                        setEditSchedule((prev) => ({
                          ...prev,
                          materials: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={scheduleActionLoading}
                      className="mt-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 disabled:opacity-70 disabled:cursor-not-allowed lg:mt-0"
                    >
                      {scheduleActionLoading ? "Saving..." : "Update schedule"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditSchedule}
                      className="mt-1 inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 lg:mt-0"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}

        {activeTab === "reports" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Reports overview
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Reports are linked to OT schedules and patients. Use your backend
              API to create and manage detailed clinical reports and
              attachments.
            </p>
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              For a full reports UI (filters by patient, schedule, type), we
              can extend this section, but the current dashboard is already
              compatible with the existing `/api/report` endpoints.
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br ${accent}`}
      >
        <span className="text-xs font-semibold text-slate-700">
          {label[0]}
        </span>
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function EntitySection({
  title,
  description,
  loading,
  columns,
  rows,
  emptyText,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading {title.toLowerCase()}...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-3 py-2 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
                >
                  {row.map((cell, i) => (
                    <td key={i} className="px-3 py-2 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

