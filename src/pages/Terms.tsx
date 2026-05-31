import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ScienceBackground } from '../components/ScienceBackground';

export const Terms: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#050B18] overflow-hidden pb-20">
      <ScienceBackground />
      <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full ambient-orb-orange z-0 pointer-events-none" />
      <div className="absolute top-[50%] -right-[10%] w-[500px] h-[500px] rounded-full ambient-orb-gold z-0 pointer-events-none" />
      <div className="absolute inset-0 grid-bg-overlay opacity-15 z-0 pointer-events-none" />

      <PageHeader 
        icon={<ShieldCheck className="w-6 h-6 animate-pulse" />}
        title="Terms & Conditions"
        subtitle="Governing terms for student portal services, payment processing, and event registrations."
        breadcrumb="Terms"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        <div className="bg-[#0D1B3E]/85 border border-white/10 backdrop-blur-[16px] rounded-2xl p-8 shadow-xl text-white space-y-6">
          
          <div>
            <h3 className="font-display font-bold text-lg text-orange-burnt mb-2">1. Introduction</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Welcome to the TGPCOP Student Council payment gateway portal. These Terms and Conditions govern your use of this digital portal for payment of NSS fees, academic quiz registrations, industrial visit collections, study materials purchase, and other council fees. By using this service, you agree to comply with and be bound by these terms.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-orange-burnt mb-2">2. Authorized Use & Student Identity</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              This payment collection system is strictly for students currently registered or registering under Tulsiramji Gaikwad Patil College of Pharmacy (TGPCOP), Nagpur. When completing a payment transaction, you must provide your true legal name, current academic year, active email ID, and WhatsApp mobile number. Providing false identity credentials or unauthorized card details will result in payment cancellation and campus disciplinary procedures.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-orange-burnt mb-2">3. Transaction Currency & Pricing</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              All transaction values, event ticket fees, registration amounts, and store items listed on this website are denominated and processed strictly in **Indian Rupees (INR)**. The total fee to be paid will be shown on the checkout portal before finalizing the payment session.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-orange-burnt mb-2">4. Payment Gateway & Third-Party Processing</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              We leverage Cashfree Payment Gateway to execute dynamic online checkout flows. We do not store or compile direct credit/debit card numbers, CVVs, net banking credentials, or UPI PINs on our servers. Processing security is managed in compliance with PCI-DSS guidelines by Cashfree.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-orange-burnt mb-2">5. Dynamic Purpose-Specific Collections</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Payments initiated on this portal must align with specified active categories set by the administrators. The portal dynamically maps the payment identifier to the Supabase database. Upon completion, a printable digital receipt will be automatically generated, and a transactional receipt copy will be instantly delivered to your email.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-orange-burnt mb-2">6. Limitation of Liability</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              The TGPCOP Student Council holds no liability for transaction failures occurring due to bank downtime, network connection drops at checkout, or invalid customer credentials. If your account was debited but the ledger logs a pending status, please contact support before attempting another transaction.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-orange-burnt mb-2">7. Governing Law</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              These terms are governed by and construed in accordance with the laws of Maharashtra, India. Any disputes arising from transactions on this website are subject to the exclusive jurisdiction of the competent courts in Nagpur, Maharashtra.
            </p>
          </div>

          <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xs text-white/40 font-semibold italic">
            <span>Last Updated: May 31, 2026</span>
            <span>TGPCOP Campus Admin Desk</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;
