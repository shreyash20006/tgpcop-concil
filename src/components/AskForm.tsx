import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { councilMembers } from '../data/council';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is TGPCOP's policy on ragging and campus discipline?",
    answer: "TGPCOP enforces a strict Zero Tolerance policy regarding ragging of any kind. The Anti-Ragging Committee, spearheaded by Anjali Hardas (Anti-Ragging Incharge), monitors the campus daily. Anyone engaged in such acts is subject to severe disciplinary and legal actions under Maharashtra laws."
  },
  {
    question: "How can I access study materials and lecture notes?",
    answer: "You can access the free study repository via the 'NotesDrive' folder on our Notices page. It contains detailed unit-wise notes, handbooks, and previous years' university question papers uploaded directly by faculty and council seniors."
  },
  {
    question: "How can I apply for cultural festivals or sports tournaments?",
    answer: "Keep an eye on the Competitions section. The Event and Cultural secretaries publish Google Forms there for direct team registrations. You can also consult Shruti Kamble (Cultural Secretary) or Nayan Thote (Events Coordinator) directly."
  },
  {
    question: "Whom should I contact if I have a fee issue or academic grievance?",
    answer: "For financial concerns, consult Laksh Jaiswal or Rohan Bhil (Treasurers). For academic, exam-related, or general college issues, you can submit your questions here addressing Nandini Rajurkar (College Issues Rep) or Vinay Deogade (General Secretary)."
  },
  {
    question: "How do I enroll in NSS (National Service Scheme) volunteer programs?",
    answer: "Enrollments for NSS occur at the beginning of each academic semester. For mid-term entry or to participate in special camps like the Blood Donation Camp, you can reach out to Shivam Waghmare (NSS Incharge) directly."
  }
];

export const AskForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultTo = searchParams.get('to') || 'General Council';

  const [formData, setFormData] = useState({
    name: '',
    year: 'B.Pharm I Year',
    directedTo: 'General Council',
    question: ''
  });

  // Pre-fill 'directedTo' if the search parameter changes
  useEffect(() => {
    if (defaultTo) {
      setFormData((prev) => ({ ...prev, directedTo: defaultTo }));
    }
  }, [defaultTo]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.question) return;

    // Simulate database write / EmailJS submit
    setIsSubmitted(true);
    setTimeout(() => {
      // Keep successful screen active
    }, 500);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto px-4 py-8">
      
      {/* 1. LEFT SIDE: Ask the Council Form Card (lg:span-7) */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="lg:col-span-7"
      >
        <div className="glass-panel rounded-2xl shadow-xl p-8 relative overflow-hidden border border-white/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-burnt/5 rounded-bl-full pointer-events-none" />
          
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-burnt/10 flex items-center justify-center text-orange-burnt">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-navy-dark">Send Your Inquiry</h2>
              <p className="text-xs text-navy-dark/65">Your submissions are reviewed directly by the student council leadership.</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="ask-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-navy-dark/75 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt bg-white/70 outline-none text-navy-dark text-sm sm:text-base transition-colors"
                  />
                </div>

                {/* Academic Year dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="year" className="block text-xs font-bold uppercase tracking-wider text-navy-dark/75 mb-2">
                      Your Year
                    </label>
                    <select
                      id="year"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt bg-white/70 outline-none text-navy-dark text-sm sm:text-base transition-colors"
                    >
                      <option>B.Pharm I Year</option>
                      <option>B.Pharm II Year</option>
                      <option>B.Pharm III Year</option>
                      <option>B.Pharm IV Year</option>
                    </select>
                  </div>

                  {/* Direct Question to dropdown */}
                  <div>
                    <label htmlFor="directedTo" className="block text-xs font-bold uppercase tracking-wider text-navy-dark/75 mb-2">
                      Direct Question To
                    </label>
                    <select
                      id="directedTo"
                      value={formData.directedTo}
                      onChange={(e) => setFormData({ ...formData, directedTo: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt bg-white/70 outline-none text-navy-dark text-sm sm:text-base transition-colors"
                    >
                      <option value="General Council">General Council</option>
                      {councilMembers.map((member) => (
                        <option key={member.id} value={member.name}>
                          {member.role.split(' ')[0]} - {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Question Text Area */}
                <div>
                  <label htmlFor="question" className="block text-xs font-bold uppercase tracking-wider text-navy-dark/75 mb-2">
                    Your Question / Grievance
                  </label>
                  <textarea
                    id="question"
                    required
                    rows={5}
                    placeholder="Provide detailed information regarding your query or feedback..."
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt bg-white/70 outline-none text-navy-dark text-sm sm:text-base transition-colors resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="group flex items-center justify-center space-x-2 w-full py-3.5 bg-orange-burnt hover:bg-orange-burnt/95 text-white font-display font-bold rounded-lg text-sm sm:text-base shadow-lg hover:shadow-orange-burnt/25 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span>Submit Question</span>
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
                <h3 className="font-display font-bold text-2xl text-navy-dark mb-2">Submitted Successfully!</h3>
                <p className="text-navy-dark/75 text-sm sm:text-base max-w-sm mb-8">
                  ✅ Your question has been submitted! The council will respond soon.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', year: 'B.Pharm I Year', directedTo: 'General Council', question: '' });
                  }}
                  className="px-6 py-2.5 bg-navy-dark hover:bg-orange-burnt text-white font-display text-sm font-semibold rounded-lg shadow transition-colors"
                >
                  Ask Another Question
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 2. RIGHT SIDE: FAQs Section (lg:span-5) */}
      <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-navy-dark/5 flex items-center justify-center text-navy-dark shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-navy-dark">Campus FAQs</h2>
            <p className="text-xs text-navy-dark/65">Find rapid answers to standard college queries.</p>
          </div>
        </div>

        {/* FAQs Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-navy-dark/5 overflow-hidden transition-shadow duration-300"
              >
                {/* Accordion header button */}
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between font-display font-bold text-sm sm:text-base text-navy-dark hover:text-orange-burnt transition-colors outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-navy-dark/45 transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180 text-orange-burnt' : ''
                    }`}
                  />
                </button>

                {/* Accordion expanding body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5 pt-1 text-sm text-navy-dark/75 leading-relaxed font-sans border-t border-navy-dark/5 bg-navy-dark/[0.01]">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AskForm;
