import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Cpu, Globe, ShieldCheck, ArrowLeft, DollarSign } from "lucide-react";
import { useState } from "react";

export default function HydroScanWebsite() {
  const [page, setPage] = useState("home");

  /* ================= BUSINESS PAGE ================= */
  if (page === "business") {
    return (
      <div className="min-h-screen bg-black text-white">
        <section className="relative px-8 py-32 text-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="relative z-10 max-w-5xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setPage("home")}
              className="mb-10 text-slate-300 hover:text-cyan-400"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-5xl md:text-6xl font-bold mb-8">Business Model</h1>
            <p className="text-xl text-slate-200">
              Building an affordable, scalable solution for large-scale microplastic monitoring.
            </p>
          </div>
        </section>

        <section className="px-8 py-32 bg-gradient-to-b from-black to-slate-900">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
            <Card className="bg-slate-800/90 backdrop-blur-xl border border-white/10 shadow-xl">
              <CardContent className="p-8">
                <DollarSign className="w-8 h-8 text-cyan-400 mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-4">Cost Structure</h3>
                <p className="text-slate-300">
                  Current single-unit build cost is approximately ₹8,000–₹10,000 (≈ $95–$120 USD), covering electronics, optics, processing hardware, and enclosure.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/90 backdrop-blur-xl border border-white/10 shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-white mb-4">Pricing Strategy</h3>
                <p className="text-slate-300">
                  Target selling price of ₹12,000 per unit (≈ $145 USD) ensures affordability for individuals, schools, and NGOs while sustaining operations.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/90 backdrop-blur-xl border border-white/10 shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-white mb-4">Profit Margin</h3>
                <p className="text-slate-300">
                  This results in an estimated profit margin of ~25–30% per unit, calculated conservatively on single-unit production cost rather than mass-manufacturing assumptions (≈ $30–$40 USD per unit).
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="px-8 py-16 text-center text-slate-400 bg-black">
          © {new Date().getFullYear()} HydroScan · Built for a cleaner future
        </footer>
      </div>
    );
  }

  /* ================= INNOVATION PAGE ================= */
  if (page === "innovation") {
    return (
      <div className="min-h-screen bg-black text-white">
        <section className="relative px-8 py-32 text-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1518837695005-2083093ee35b"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="relative z-10 max-w-5xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setPage("home")}
              className="mb-10 text-slate-300 hover:text-cyan-400"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold mb-8"
            >
              The HydroScan Innovation
            </motion.h1>
            <p className="text-xl text-slate-200 leading-relaxed">
              HydroScan combines controlled optics, imaging, and on-device intelligence
              to make invisible microplastic pollution visible—directly at the point of use.
            </p>
          </div>
        </section>

        <section className="px-8 py-32 bg-gradient-to-b from-black to-slate-900">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-semibold mb-6">Controlled Optical Environment</h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                A water sample is placed inside a transparent chamber with carefully
                controlled lighting. Suspended microplastic particles interact with
                light to form characteristic scattering patterns that can be captured
                digitally, even though they remain invisible to the naked eye.
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1581091870627-3d4c1d8a7f1b"
              className="rounded-3xl shadow-2xl"
            />
          </div>
        </section>

        <section className="px-8 py-32 bg-black">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <img
              src="https://images.unsplash.com/photo-1518770660439-4636190af475"
              className="rounded-3xl shadow-2xl"
            />
            <div>
              <h2 className="text-3xl font-semibold mb-6">On-Device Intelligence</h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Captured images are processed locally using a trained machine learning
                model running entirely on-device. This eliminates the need for
                internet connectivity, cloud computing, or chemical reagents.
              </p>
            </div>
          </div>
        </section>

        <section className="px-8 py-32 bg-gradient-to-b from-slate-900 to-black">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-6">Designed for the Real World</h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              By removing dependence on laboratories and recurring per-test costs,
              HydroScan enables frequent, on-site screening in schools, remote
              communities, disaster-affected regions, and research fieldwork.
            </p>
          </div>
        </section>

        {/* Physical Prototype */}
        <section className="px-8 py-32 bg-black">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-semibold text-center mb-16">Physical Prototype</h2>
            <p className="text-slate-300 text-lg text-center max-w-3xl mx-auto mb-12">
              A working HydroScan prototype demonstrating the optical chamber,
              on-device processing, and integrated imaging system used during
              validation and testing.
            </p>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <img
                src="/prototype-exterior.jpg"
                alt="HydroScan prototype exterior with illuminated chamber"
                className="rounded-3xl shadow-2xl"
              />
              <img
                src="/prototype-interior.jpg"
                alt="HydroScan prototype interior showing camera and electronics"
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </section>

        <footer className="px-8 py-16 text-center text-slate-400 bg-black">
          © {new Date().getFullYear()} HydroScan · Built for a cleaner future
        </footer>
      </div>
    );
  }

  /* ================= HOME PAGE ================= */
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative px-8 py-40 text-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-6xl md:text-7xl font-bold tracking-tight mb-8"
          >
            HydroScan
          </motion.h1>
          <p className="text-2xl text-slate-200 max-w-3xl mx-auto mb-10">
            Revealing invisible microplastic pollution through portable, on-site intelligence.
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            <Button
              onClick={() => setPage("innovation")}
              className="text-lg px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
            >
              The Tech
            </Button>
            <Button
              onClick={() => setPage("business")}
              className="text-lg px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
            >
              Business Model
            </Button>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-8 py-32 bg-black">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-8">Our Story</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Microplastic pollution is a growing global problem, yet it remains largely invisible.
            HydroScan began with a simple question: if contamination cannot be seen or measured
            easily, how can communities be expected to act? Our mission is to make microplastic
            pollution visible, measurable, and impossible to ignore—empowering individuals,
            schools, and communities with accessible science.
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-8 py-32 bg-gradient-to-b from-black to-slate-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-semibold mb-6">The Invisible Crisis</h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Microplastics are silently entering our rivers, oceans, food systems,
              and drinking water. Their microscopic size makes them nearly impossible
              to detect, allowing pollution to spread unchecked while existing
              testing remains slow, expensive, and inaccessible.
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
            className="rounded-3xl shadow-2xl"
          />
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="px-8 py-32 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-semibold text-center mb-20">Core Capabilities</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <Card className="bg-slate-800/90 backdrop-blur-xl shadow-xl border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-cyan-500/20">
              <CardContent className="p-8">
                <Cpu className="w-10 h-10 mb-6 text-cyan-400" />
                <h3 className="text-2xl font-semibold mb-4 text-white">Precision Optics</h3>
                <p className="text-slate-300">
                  Light interactions reveal patterns created by suspended particles
                  within a controlled environment.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/90 backdrop-blur-xl shadow-xl border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-cyan-500/20">
              <CardContent className="p-8">
                <ShieldCheck className="w-10 h-10 mb-6 text-cyan-400" />
                <h3 className="text-2xl font-semibold mb-4 text-white">On-Device Analysis</h3>
                <p className="text-slate-300">
                  Intelligence runs locally, ensuring reliable analysis without
                  external connectivity.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/90 backdrop-blur-xl shadow-xl border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-cyan-500/20">
              <CardContent className="p-8">
                <Globe className="w-10 h-10 mb-6 text-cyan-400" />
                <h3 className="text-2xl font-semibold mb-4 text-white">Real-World Use</h3>
                <p className="text-slate-300">
                  Built for environments where laboratory testing is not feasible.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Prototype Gallery */}
      <section className="px-8 py-32 bg-gradient-to-b from-black to-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-semibold text-center mb-16">Physical Prototype</h2>
          <p className="text-slate-300 text-lg text-center max-w-3xl mx-auto mb-12">
            Images from the working HydroScan prototype showing the optical chamber,
            internal electronics, camera module, and on-device display used during
            testing and validation.
          </p>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <img
              src="/prototype-exterior.jpg"
              alt="HydroScan prototype exterior with illuminated chamber"
              className="rounded-3xl shadow-2xl"
            />
            <img
              src="/prototype-interior.jpg"
              alt="HydroScan prototype interior showing camera and electronics"
              className="rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Business Model Summary (existing section kept) */}
      <section className="px-8 py-32 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-8">Business Model</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            HydroScan follows a one-time purchase, B2C-first model—eliminating
            recurring testing costs and enabling frequent monitoring. Future
            expansion includes institutional licensing and large-scale deployments.
          </p>
        </div>
      </section>

      {/* Funding Section (added without removing anything) */}
      <section className="px-8 py-32 bg-black">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-6">Funding & Growth</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            HydroScan is currently self-developed and bootstrapped. Initial funding
            will be used to refine the prototype, optimize manufacturing, and
            conduct pilot deployments with schools, NGOs, and research institutions.
          </p>
        </div>
      </section>

      {/* Brand Section */}
      <section className="px-8 py-32 bg-gradient-to-b from-black to-slate-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-8">Our Brand</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
           Our visual identity is inspired by water and technology. Deep blacks and slate tones reflect the seriousness of the environmental challenge, while cyan and blue accents symbolize clarity, precision, and clean water. The design is intentionally minimal and modern, allowing the science and impact to remain at the forefront without distraction.
HydroScan’s voice is clear, evidence-driven, and accessible. We communicate with transparency and accuracy, avoiding unnecessary complexity while maintaining scientific credibility. Whether addressing students, communities, researchers, or decision-makers, our messaging emphasizes awareness, empowerment, and real-world impact.
At its core, the HydroScan brand stands for democratizing environmental monitoring. By removing barriers such as laboratory dependence, high costs, and technical inaccessibility, we aim to give communities the tools they need to understand water quality and take informed action. HydroScan is not just a device—it is a commitment to visibility, accountability, and a cleaner future.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="px-8 py-32 bg-black">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-14">Meet the Team</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <Card className="bg-slate-900/80 backdrop-blur-xl border border-cyan-400/30 shadow-2xl">
              <CardContent className="p-10">
                <h3 className="text-2xl font-bold text-cyan-400 mb-2">Anay Mehta</h3>
                <p className="text-slate-300">Co-founder · Engineering & AI</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/80 backdrop-blur-xl border border-cyan-400/30 shadow-2xl">
              <CardContent className="p-10">
                <h3 className="text-2xl font-bold text-cyan-400 mb-2">Yuvraj</h3>
                <p className="text-slate-300">Co-founder · Hardware & Systems</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="px-8 py-16 text-center text-slate-400 bg-black">
        © {new Date().getFullYear()} HydroScan · Built for a cleaner future
      </footer>
    </div>
  );
}
