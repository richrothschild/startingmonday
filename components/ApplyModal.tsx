"use client";

import { useState } from "react";
import { CheckIcon } from "./icons";

interface ApplyModalProps {
  jobTitle: string;
  company: string;
}

export default function ApplyModal({ jobTitle, company }: ApplyModalProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app this would send the application to the server
    setSubmitted(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setSubmitted(false), 300);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-6 w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
      >
        Apply Now
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="w-7 h-7 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Application submitted!
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Thanks for applying to{" "}
                  <span className="font-medium">{jobTitle}</span> at{" "}
                  <span className="font-medium">{company}</span>. We&apos;ll be
                  in touch soon.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Apply for {jobTitle}
                </h2>
                <p className="text-sm text-gray-500 mb-5">{company}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Full name *
                    </label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Cover letter
                    </label>
                    <textarea
                      value={form.coverLetter}
                      onChange={(e) =>
                        setForm({ ...form, coverLetter: e.target.value })
                      }
                      rows={4}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      placeholder="Tell us why you're a great fit..."
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      Submit application
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
