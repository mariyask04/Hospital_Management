"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "../../lib/api";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "patients", label: "Patients" },
  { id: "schedules", label: "OT Schedules" },
];

export default function UserDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");
  const [stats, setStats] = useState({
    patients: 0,
    schedules: 0,
  });
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState("");

  const [patients, setPatients] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const storedName =
      typeof window !== "undefined" ? localStorage.getItem("name") : "";
    const storedRole =
      typeof window !== "undefined" ? localStorage.getItem("role") : "";

    if (!token) {
      router.replace("/");
      return;
    }

    setUserName(storedName || "");
    setRole(storedRole || "");
    fetchOverview();
  }, [router]);

  const safeGet = async (path) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
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

  const fetchOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const [patientData, scheduleData] = await Promise.all([
        safeGet("/patient/getAll"),
        safeGet("/otschedule/getAll"),
      ]);

      const patientCount =
        patientData?.count ?? patientData?.patients?.length ?? patientData?.length ?? 0;
      const scheduleCount =
        scheduleData?.count ?? scheduleData?.schedules?.length ?? scheduleData?.length ?? 0;

      setStats({
        patients: patientCount,
        schedules: scheduleCount,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load overview"));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (id) => {
    setActiveTab(id);
    if (id === "patients") {
      await loadPatients();
    } else if (id === "schedules") {
      await loadSchedules();
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
              <p className="text-xs text-slate-500">User dashboard</p>
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-700">
              You can browse patients and OT schedules using the tabs above.
              Actions like creating or editing doctors and reports are reserved
              for admins.
            </div>
          </section>
        )}

        {activeTab === "patients" && (
          <EntitySection
            title="Patients"
            description="Browse registered patients scheduled for OT."
            loading={listLoading}
            columns={["Name", "Age", "Gender", "Contact"]}
            rows={patients.map((p) => [
              p.name,
              p.age,
              p.gender,
              p.contact,
            ])}
            emptyText="No patients found."
          />
        )}

        {activeTab === "schedules" && (
          <EntitySection
            title="OT Schedules"
            description="Overview of scheduled operations and their status."
            loading={listLoading}
            columns={["Date", "OT #", "Status", "Anesthesia", "Patient"]}
            rows={schedules.map((s) => [
              new Date(s.date).toLocaleString(),
              s.otNumber,
              s.status,
              s.anesthesiaType,
              typeof s.patient === "object" ? s.patient.name : s.patient,
            ])}
            emptyText="No OT schedules found."
          />
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
        <p className="text-sm text-slate-500">
          Loading {title.toLowerCase()}...
        </p>
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

