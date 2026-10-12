import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { ProjectTypeEntryCards } from '../components/home/ProjectTypeEntryCards';
import { InteractiveEstimatePreview } from '../components/home/InteractiveEstimatePreview';
import { IntegratedWorkflowSection } from '../components/home/IntegratedWorkflowSection';
import { ContractorQuotationComparisonSection } from '../components/home/ContractorQuotationComparisonSection';
import { MaterialsQuantityPlanningSection } from '../components/home/MaterialsQuantityPlanningSection';
import { ProjectWorkspacePreviewSection } from '../components/home/ProjectWorkspacePreviewSection';
import { IndividualServicesSection } from '../components/home/IndividualServicesSection';
import { TrustTransparencyFinalCTA } from '../components/home/TrustTransparencyFinalCTA';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section A: Integrated Hero with Living Product Preview & Accurate Narrative */}
      <HeroSection />

      {/* Section B: Project-Type Entry Cards (Build, Renovate, Improve a space, Fix/maintain) */}
      <ProjectTypeEntryCards />

      {/* Section C: Interactive Estimate Preview (Shared Pricing Engine with City Multipliers) */}
      <InteractiveEstimatePreview />

      {/* Section D: Explain the Integrated Workflow (6 connected lifecycle stages with shared data) */}
      <IntegratedWorkflowSection />

      {/* Section E: Contractor Quotation Comparison (Side-by-side bids with inclusions & exclusions) */}
      <ContractorQuotationComparisonSection />

      {/* Section F: Materials and Quantity Planning (CPWD norms & calculated BOQ) */}
      <MaterialsQuantityPlanningSection />

      {/* Section G: Project Workspace Preview (Milestones, tasks, photo logs, expenses) */}
      <ProjectWorkspacePreviewSection />

      {/* Section H: Individual Services (On-demand trades & daily civil labour booking) */}
      <IndividualServicesSection />

      {/* Section I: Trust, Transparency, and Final Integrated Platform CTA */}
      <TrustTransparencyFinalCTA />
    </div>
  );
};
