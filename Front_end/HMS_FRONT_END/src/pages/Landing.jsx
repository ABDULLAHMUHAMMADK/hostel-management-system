import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  BedDouble, 
  Users, 
  CreditCard, 
  Bell, 
  Shield, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Building2,
  ClipboardList,
  Megaphone,
  Wallet,
  UserCheck,
  Clock,
  Mail,
  Phone,
  MapPin,
  Send,
  User,
  MessageSquare,
  AlertCircle,
  Loader2,
  Menu,
  X
} from "lucide-react";
import DotGridBg from "../components/DotGridBg.jsx";
import API from "../api/client.js";

// ─── ANIMATED BORDER COMPONENT ──────────────────────────────────────────────
function AnimatedBorder({ accent }) {
  return (
    <div 
      className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[30%] group-hover:h-full transition-all duration-300 ease-in-out z-20 rounded-r"
      style={{ backgroundColor: accent }}
    />
  );
}

// ─── FEATURE CARD ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <div 
        className="bg-white rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
      >
        <AnimatedBorder accent={accent} />
        <div className="pl-4 z-10 relative">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: `${accent}15` }}
          >
            <Icon size={22} style={{ color: accent }} />
          </div>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  // ─── CONTACT FORM STATE ──────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ─── CLOSE MOBILE MENU ON RESIZE ──────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const features = [
    {
      icon: BedDouble,
      title: "Room Management",
      description: "Easily allocate, track, and manage hostel rooms with real-time availability updates.",
      accent: "#00a896"
    },
    {
      icon: Users,
      title: "Student Roster",
      description: "Maintain a complete student database with room assignments and contact information.",
      accent: "#6366f1"
    },
    {
      icon: CreditCard,
      title: "Fee Management",
      description: "Streamline fee collection with automated invoicing and payment tracking.",
      accent: "#f59e0b"
    },
    {
      icon: Bell,
      title: "Notice Board",
      description: "Instantly broadcast important announcements to students and staff.",
      accent: "#3b82f6"
    },
    {
      icon: ClipboardList,
      title: "Complaint System",
      description: "Efficiently manage and resolve student complaints with a structured workflow.",
      accent: "#ef4444"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Get real-time insights with occupancy rates, fee collection, and performance metrics.",
      accent: "#8b5cf6"
    }
  ];

  const benefits = [
    "Real-time room availability tracking",
    "Automated fee invoicing & reminders",
    "Secure role-based access control",
    "Mobile-responsive design",
    "Instant notification system",
    "Comprehensive analytics & reporting"
  ];

  // ─── HANDLE FORM INPUT CHANGE ────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  // ─── HANDLE FORM SUBMIT ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      setFormError("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const response = await API.post("/admin/contact", formData);
      
      if (response.data?.success) {
        setFormSuccess("Your message has been sent successfully! We'll get back to you soon.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setTimeout(() => setFormSuccess(""), 5000);
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setFormError(
        err.response?.data?.message || 
        "Failed to send message. Please try again later."
      );
      setTimeout(() => setFormError(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-teal-500 selection:text-white relative overflow-x-hidden">
      
      {/* ─── HERO SECTION WITH DOT GRID ────────────────────────────────────── */}
      <div className="relative min-h-screen flex flex-col">
        <DotGridBg />
        
        {/* Navigation Bar */}
        <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md shadow-teal-600/20">
              H
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              HMS Pro
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-500 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-xl z-20 mx-4 rounded-2xl p-4 border border-slate-100"
          >
            <div className="flex flex-col space-y-3">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors px-4 py-2 rounded-lg hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white text-center hover:bg-teal-500 transition-all"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}

        {/* Hero Content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center relative z-10 flex-1 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center rounded-full bg-teal-50/80 backdrop-blur-sm px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-teal-700 mb-3 sm:mb-4 border border-teal-100"
          >
            ✨ Simplistic Smart Accommodation Software
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-3xl leading-[1.15] px-2"
          >
            Manage Your Hostel Living Experience{" "}
            <span className="text-teal-600 block sm:inline">Effortlessly</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed px-4"
          >
            An attractive, calm platform designed for both students and wardens.
            Track available rooms, process registrations instantly, and keep your
            hostel operations cleanly organized.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto text-center rounded-xl bg-teal-600 px-6 sm:px-8 py-3 sm:py-4 font-semibold text-white shadow-xl shadow-teal-600/20 hover:bg-teal-500 transition-all hover:shadow-teal-500/30 active:scale-[0.98] text-sm sm:text-base"
            >
              Register as New User
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto text-center rounded-xl bg-white px-6 sm:px-8 py-3 sm:py-4 font-semibold text-slate-700 border border-slate-200 shadow-lg shadow-slate-200/50 hover:bg-slate-50 transition-all active:scale-[0.98] text-sm sm:text-base"
            >
              Access Dashboard Account
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-4"
          >
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
              <Shield size={14} className="text-emerald-500" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
              <Clock size={14} className="text-teal-500" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
              <UserCheck size={14} className="text-indigo-500" />
              <span>Verified Users</span>
            </div>
          </motion.div>
        </main>
      </div>

      {/* ─── SECTION 1: FEATURES ────────────────────────────────────────────── */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block text-[10px] sm:text-xs font-black uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full"
            >
              Features
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mt-3 px-2"
            >
              Everything You Need to Manage Your Hostel
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto mt-2 px-4"
            >
              Powerful tools designed to simplify hostel management for wardens, students, and administrators.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                {...feature} 
                delay={index * 0.1} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: BENEFITS + CONTACT FORM ────────────────────────────── */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* Left Side - Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                Why HMS Pro
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mt-3 px-2">
                Built for Modern Hostel Management
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-3 leading-relaxed px-2">
                Our platform combines powerful features with an intuitive interface,
                making hostel management simple, efficient, and stress-free.
              </p>

              <div className="mt-6 space-y-3 px-2">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center gap-3 bg-white rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm"
                  >
                    <CheckCircle size={16} className="text-teal-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-slate-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 px-2">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-500 transition-all text-sm"
                >
                  Get Started <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-sm"
                >
                  View Dashboard
                </Link>
              </div>
            </motion.div>

            {/* Right Side - Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl p-4 sm:p-6 md:p-8"
              style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
                  <Mail size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800">Contact Us</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400">We'll get back to you within 24 hours</p>
                </div>
              </div>

              {/* Success Message */}
              {formSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle size={16} className="shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Error Message */}
              {formError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-2.5 sm:top-3 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-2.5 sm:top-3 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-2.5 sm:top-3 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare size={15} className="absolute left-3 top-2.5 sm:top-3 text-slate-400" />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="How can we help you?"
                      className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your inquiry..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20 hover:shadow-teal-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message <Send size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Contact Info */}
              <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
                  <Mail size={14} className="text-teal-500 shrink-0" />
                  <span className="truncate">support@hmspro.com</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
                  <Phone size={14} className="text-teal-500 shrink-0" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 3: CTA ───────────────────────────────────────────────────── */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 bg-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl md:text-4xl font-black text-white px-2"
          >
            Ready to Transform Your Hostel Management?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm sm:text-base md:text-lg text-teal-100 mt-3 max-w-2xl mx-auto px-4"
          >
            Join thousands of hostels already using HMS Pro to streamline their operations.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto text-center rounded-xl bg-white px-6 sm:px-8 py-3 sm:py-4 font-semibold text-teal-600 shadow-xl hover:bg-slate-50 transition-all hover:shadow-white/20 active:scale-[0.98] text-sm sm:text-base"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto text-center rounded-xl bg-teal-500/30 px-6 sm:px-8 py-3 sm:py-4 font-semibold text-white border border-teal-400/50 hover:bg-teal-500/40 transition-all active:scale-[0.98] text-sm sm:text-base"
            >
              Sign In to Dashboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 bg-slate-900 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
                  H
                </div>
                <span className="text-lg font-bold text-white">HMS Pro</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Smart hostel management system designed for modern accommodation needs.
              </p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">About</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
                <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3">Legal</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
                <li className="hover:text-white transition-colors cursor-pointer">Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-slate-500">
            &copy; 2026 HMS Pro Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}