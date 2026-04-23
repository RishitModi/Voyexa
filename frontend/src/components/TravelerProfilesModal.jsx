import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Users, X } from "lucide-react";

const RELATIONS = ["self", "spouse", "child", "parent", "friend", "other"];
const GENDERS = ["male", "female", "other"];
const DIETARY = ["veg", "non_veg", "vegan"];
const MOBILITY = ["none", "limited_walking", "wheelchair", "elderly_friendly"];

const emptyForm = {
  name: "",
  relation: "self",
  dob: "",
  gender: "",
  dietaryPreferences: "",
  mobilityLevel: "",
  nationality: "",
  interestsText: "",
};

export default function TravelerProfilesModal({ isOpen, onClose, userId, onProfilesChanged }) {
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const canSave = useMemo(() => form.name.trim().length > 0, [form.name]);

  useEffect(() => {
    if (!isOpen || !userId) return;
    fetchProfiles();
  }, [isOpen, userId]);

  const fetchProfiles = async () => {
    setError("");
    try {
      const res = await fetch(`http://localhost:8080/api/traveler-profiles/user/${userId}`);
      if (!res.ok) throw new Error("Unable to load traveler profiles.");
      const data = await res.json();
      setProfiles(Array.isArray(data) ? data : []);
      onProfilesChanged?.(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load traveler profiles.");
    }
  };

  const handleCreate = async () => {
    if (!canSave || !userId) return;
    setIsSaving(true);
    setError("");

    const interests = form.interestsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      userId,
      name: form.name.trim(),
      relation: form.relation || null,
      dob: form.dob || null,
      gender: form.gender || null,
      dietaryPreferences: form.dietaryPreferences || null,
      mobilityLevel: form.mobilityLevel || null,
      nationality: form.nationality.trim() || null,
      interests,
    };

    try {
      const res = await fetch("http://localhost:8080/api/traveler-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Unable to save profile.");
      }
      setForm(emptyForm);
      await fetchProfiles();
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (profileId) => {
    if (!userId) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/traveler-profiles/${profileId}?userId=${userId}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Unable to delete profile.");
      }
      await fetchProfiles();
    } catch (err) {
      setError(err.message || "Unable to delete profile.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#0a0f1d]/95 border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Users size={24} className="text-indigo-400" />
            Traveler Profiles
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="p-6 border-r border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Add Profile</h3>
            <div className="space-y-3">
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Profile name"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.relation}
                  onChange={(e) => setForm((prev) => ({ ...prev, relation: e.target.value }))}
                  className="traveler-select px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  {RELATIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm((prev) => ({ ...prev, dob: e.target.value }))}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.gender}
                  onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                  className="traveler-select px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value="">gender</option>
                  {GENDERS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <select
                  value={form.dietaryPreferences}
                  onChange={(e) => setForm((prev) => ({ ...prev, dietaryPreferences: e.target.value }))}
                  className="traveler-select px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value="">diet</option>
                  {DIETARY.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.mobilityLevel}
                  onChange={(e) => setForm((prev) => ({ ...prev, mobilityLevel: e.target.value }))}
                  className="traveler-select px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value="">mobility</option>
                  {MOBILITY.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <input
                  value={form.nationality}
                  onChange={(e) => setForm((prev) => ({ ...prev, nationality: e.target.value }))}
                  placeholder="Nationality"
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <input
                value={form.interestsText}
                onChange={(e) => setForm((prev) => ({ ...prev, interestsText: e.target.value }))}
                placeholder="Interests (comma separated)"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={!canSave || isSaving}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                {isSaving ? "Saving..." : "Add Profile"}
              </button>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Saved Profiles</h3>
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {profiles.length === 0 ? (
                <div className="text-slate-400 text-sm">No profiles added yet.</div>
              ) : (
                profiles.map((profile) => (
                  <div key={profile.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-white font-bold">{profile.name}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {profile.relation || "relation"} • {profile.mobilityLevel || "mobility not set"} • {profile.dietaryPreferences || "diet not set"}
                        </div>
                        {(profile.interests || []).length > 0 && (
                          <div className="mt-2 text-xs text-indigo-300">
                            {(profile.interests || []).join(", ")}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(profile.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {error && <div className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
