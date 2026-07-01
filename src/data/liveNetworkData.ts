// AUTO-GENERATED from customer file: Supplier_data_file_qsc_testing_v1.xlsx
// 792 BOM parts -> QSC Aerospace sub-tier network. Do not edit by hand;
// regenerate with scripts/gen_live_network.py if the source file changes.
//
// DERIVATIONS (the source sheet has no revenue, geo, or lens columns):
//   revenueAtRisk  -> DERIVED EXPOSURE INDEX, not dollars.
//                     raw = sum(impactWeight[High=3,Med=2,Low=1] * WhereUsed) per node,
//                     scaled so the largest tier-1 ~= 25 (to reuse the $M-scaled UI).
//   riskScore      -> where-used-weighted base (High 78 / Med 55 / Low 30)
//                     + single-source bump.
//   isSPOF         -> majority single-sourced (MPN status SS / item SSS) AND some High-impact part.
//   isChokePoint   -> Z2 (sub-tier) legal entity shared by >1 distinct tier-1 supplier.
//   primaryImpact  -> mapped from dominant commodity family.
//   location       -> lookup for well-known suppliers; otherwise "Global".
//   topRiskLens    -> synthesized from sourcing/choke posture.
//
import type { SubTierFullNode } from './subtierMockData';

export const QSC_LIVE_NETWORK: SubTierFullNode = {
  id: "QSC",
  name: "QSC Aerospace",
  tier: 0,
  location: {
    city: "El Segundo",
    country: "USA"
  },
  commodity: "OEM",
  riskScore: 0,
  primaryImpact: "Delivery",
  revenueAtRisk: null,
  isSPOF: false,
  isChokePoint: false,
  topRiskLens: "\u2014",
  topRiskLensLabel: "\u2014",
  action: "\u2014",
  children: [
    {
      id: "T1-KOA",
      name: "KOA",
      tier: 1,
      location: {
        city: "Nagano",
        country: "Japan"
      },
      commodity: "Chip Resistors",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 25.0,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 49 parts across 9624 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-PANASONIC",
      name: "PANASONIC",
      tier: 1,
      location: {
        city: "Osaka",
        country: "Japan"
      },
      commodity: "Chip Resistors",
      riskScore: 52,
      primaryImpact: "Delivery",
      revenueAtRisk: 24.244,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 68 parts across 9881 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-VTECH-DONGGUAN",
      name: "VTECH (DONGGUAN)",
      tier: 1,
      location: {
        city: "Dongguan",
        country: "China"
      },
      commodity: "PLASTIC",
      riskScore: 78,
      primaryImpact: "Cost",
      revenueAtRisk: 20.141,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 81 parts across 5169 assemblies; multi-sourced.",
      children: [
        {
          id: "T2-VTECH-COMMUNICATIONS-LTD",
          name: "VTech Communications Ltd",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "PLASTIC",
          riskScore: 76,
          primaryImpact: "Cost",
          revenueAtRisk: 21.648,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through VTech Communications Ltd. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-SAMSUNG",
      name: "SAMSUNG",
      tier: 1,
      location: {
        city: "Suwon",
        country: "South Korea"
      },
      commodity: "Ceramic Capacitors",
      riskScore: 56,
      primaryImpact: "Delivery",
      revenueAtRisk: 14.816,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 33 parts across 5563 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-ROYAL-OHM",
      name: "ROYAL OHM",
      tier: 1,
      location: {
        city: "Dongguan",
        country: "China"
      },
      commodity: "Chip Resistors",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 14.674,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Chip Resistors.",
      children: []
    },
    {
      id: "T1-ON-SEMICONDUCTOR",
      name: "ON SEMICONDUCTOR",
      tier: 1,
      location: {
        city: "Phoenix",
        country: "USA"
      },
      commodity: "Rectifiers",
      riskScore: 77,
      primaryImpact: "Delivery",
      revenueAtRisk: 12.509,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Rectifiers. 23 parts across 3819 assemblies.",
      children: []
    },
    {
      id: "T1-GP-ELECTRONICS-HUIZHOU-CO",
      name: "GP ELECTRONICS (HUIZHOU) CO.",
      tier: 1,
      location: {
        city: "Huizhou",
        country: "China"
      },
      commodity: "CAPACITOR",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 11.997,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for CAPACITOR. 21 parts across 3079 assemblies.",
      children: []
    },
    {
      id: "T1-VISHAY",
      name: "VISHAY",
      tier: 1,
      location: {
        city: "Malvern",
        country: "USA"
      },
      commodity: "Chip Resistors",
      riskScore: 48,
      primaryImpact: "Delivery",
      revenueAtRisk: 11.491,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 38 parts across 5141 assemblies; multi-sourced.",
      children: [
        {
          id: "T2-VISHAY-INTERTECHNOLOGY-INC",
          name: "Vishay Intertechnology, Inc.",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Chip Resistors",
          riskScore: 52,
          primaryImpact: "Delivery",
          revenueAtRisk: 11.99,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through Vishay Intertechnology, Inc.. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-TEXAS-INSTRUMENTS",
      name: "TEXAS INSTRUMENTS",
      tier: 1,
      location: {
        city: "Dallas",
        country: "USA"
      },
      commodity: "Linear Voltage Regulators",
      riskScore: 56,
      primaryImpact: "Delivery",
      revenueAtRisk: 11.11,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 38 parts across 4477 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-YAGEO",
      name: "YAGEO",
      tier: 1,
      location: {
        city: "New Taipei",
        country: "Taiwan"
      },
      commodity: "Chip Resistors",
      riskScore: 58,
      primaryImpact: "Delivery",
      revenueAtRisk: 9.633,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 23 parts across 3472 assemblies; multi-sourced.",
      children: [
        {
          id: "T2-YAGEO-CORPORATION",
          name: "YAGEO Corporation",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Chip Resistors",
          riskScore: 58,
          primaryImpact: "Delivery",
          revenueAtRisk: 9.676,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through YAGEO Corporation. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-TAIYO-YUDEN",
      name: "TAIYO YUDEN",
      tier: 1,
      location: {
        city: "Tokyo",
        country: "Japan"
      },
      commodity: "Ceramic Capacitors",
      riskScore: 66,
      primaryImpact: "Delivery",
      revenueAtRisk: 9.532,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 12 parts across 2967 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-NEXPERIA",
      name: "NEXPERIA",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Rectifiers",
      riskScore: 72,
      primaryImpact: "Delivery",
      revenueAtRisk: 7.484,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Rectifiers. 11 parts across 2489 assemblies.",
      children: []
    },
    {
      id: "T1-STACKPOLE",
      name: "STACKPOLE",
      tier: 1,
      location: {
        city: "Raleigh",
        country: "USA"
      },
      commodity: "Chip Resistors",
      riskScore: 54,
      primaryImpact: "Delivery",
      revenueAtRisk: 6.929,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 18 parts across 2723 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-DIODES-INC",
      name: "DIODES INC.",
      tier: 1,
      location: {
        city: "Plano",
        country: "USA"
      },
      commodity: "Rectifiers",
      riskScore: 69,
      primaryImpact: "Delivery",
      revenueAtRisk: 6.628,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 12 parts across 1957 assemblies; multi-sourced.",
      children: [
        {
          id: "T2-DIODES-INCORPORATED",
          name: "Diodes Incorporated",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Rectifiers",
          riskScore: 70,
          primaryImpact: "Delivery",
          revenueAtRisk: 7.851,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through Diodes Incorporated. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-KEMET",
      name: "KEMET",
      tier: 1,
      location: {
        city: "Fort Lauderdale",
        country: "USA"
      },
      commodity: "Ceramic Capacitors",
      riskScore: 56,
      primaryImpact: "Delivery",
      revenueAtRisk: 6.531,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 17 parts across 2665 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-MURATA",
      name: "MURATA",
      tier: 1,
      location: {
        city: "Kyoto",
        country: "Japan"
      },
      commodity: "Ceramic Capacitors",
      riskScore: 63,
      primaryImpact: "Delivery",
      revenueAtRisk: 5.58,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 54% single-sourced. Review dual-source options for Ceramic Capacitors.",
      children: []
    },
    {
      id: "T1-WALSIN",
      name: "WALSIN",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Ceramic Capacitors",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 5.491,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 9 parts across 1868 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-ROHM",
      name: "ROHM",
      tier: 1,
      location: {
        city: "Kyoto",
        country: "Japan"
      },
      commodity: "GP BJTs",
      riskScore: 77,
      primaryImpact: "Delivery",
      revenueAtRisk: 5.321,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for GP BJTs. 5 parts across 1625 assemblies.",
      children: []
    },
    {
      id: "T1-GREENCONN",
      name: "GREENCONN",
      tier: 1,
      location: {
        city: "Taoyuan",
        country: "Taiwan"
      },
      commodity: "Terminal Block Headers and Receptacles",
      riskScore: 88,
      primaryImpact: "Cost",
      revenueAtRisk: 4.282,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Terminal Block Headers and Receptacles. 12 parts across 1099 assemblies.",
      children: []
    },
    {
      id: "T1-ACCUTITE",
      name: "ACCUTITE",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "HARDWARE",
      riskScore: 65,
      primaryImpact: "Cost",
      revenueAtRisk: 3.897,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for HARDWARE.",
      children: []
    },
    {
      id: "T1-BOURNS",
      name: "BOURNS",
      tier: 1,
      location: {
        city: "Riverside",
        country: "USA"
      },
      commodity: "Fixed Inductors",
      riskScore: 56,
      primaryImpact: "Delivery",
      revenueAtRisk: 3.834,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 14 parts across 1448 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-ST-MICROELECTRONICS",
      name: "ST MICROELECTRONICS",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Rectifiers",
      riskScore: 56,
      primaryImpact: "Delivery",
      revenueAtRisk: 3.589,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 8 parts across 1451 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-LITTELFUSE",
      name: "LITTELFUSE",
      tier: 1,
      location: {
        city: "Chicago",
        country: "USA"
      },
      commodity: "Fuses",
      riskScore: 74,
      primaryImpact: "Compliance",
      revenueAtRisk: 3.298,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 7 parts across 955 assemblies; multi-sourced.",
      children: [
        {
          id: "T2-LITTELFUSE-INC",
          name: "Littelfuse, Inc.",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Fuses",
          riskScore: 68,
          primaryImpact: "Compliance",
          revenueAtRisk: 3.687,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 3 tier-1 suppliers route through Littelfuse, Inc.. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-JST",
      name: "JST",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Rectangular Connector Headers and Receptacles",
      riskScore: 55,
      primaryImpact: "Cost",
      revenueAtRisk: 3.094,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 12 parts across 1191 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-KYOCERA-AVX",
      name: "KYOCERA AVX",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Ceramic Capacitors",
      riskScore: 43,
      primaryImpact: "Delivery",
      revenueAtRisk: 2.724,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 6 parts across 1370 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-GOLDENBAMBOO",
      name: "GOLDENBAMBOO",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Power Transformers",
      riskScore: 88,
      primaryImpact: "Compliance",
      revenueAtRisk: 2.579,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Power Transformers. 5 parts across 662 assemblies.",
      children: []
    },
    {
      id: "T1-FENGHUA",
      name: "FENGHUA",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Ceramic Capacitors",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 2.373,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Ceramic Capacitors. 2 parts across 609 assemblies.",
      children: []
    },
    {
      id: "T1-INFINEON",
      name: "INFINEON",
      tier: 1,
      location: {
        city: "Neubiberg",
        country: "Germany"
      },
      commodity: "MOSFETs",
      riskScore: 64,
      primaryImpact: "Delivery",
      revenueAtRisk: 2.32,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 9 parts across 802 assemblies; multi-sourced.",
      children: [
        {
          id: "T2-INFINEON-TECHNOLOGIES-AG",
          name: "Infineon Technologies AG",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "MOSFETs",
          riskScore: 72,
          primaryImpact: "Delivery",
          revenueAtRisk: 2.834,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through Infineon Technologies AG. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-TEAPO",
      name: "TEAPO",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Aluminum Electrolytic Capacitors",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 2.303,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Aluminum Electrolytic Capacitors. 5 parts across 591 assemblies.",
      children: []
    },
    {
      id: "T1-LITE-ON-TECHNOLOGY",
      name: "LITE-ON TECHNOLOGY",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "LED Indication",
      riskScore: 80,
      primaryImpact: "Compliance",
      revenueAtRisk: 2.265,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for LED Indication. 3 parts across 654 assemblies.",
      children: []
    },
    {
      id: "T1-SURGE-LELON",
      name: "SURGE/LELON",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Aluminum Electrolytic Capacitors",
      riskScore: 82,
      primaryImpact: "Delivery",
      revenueAtRisk: 2.143,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 3 parts across 550 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-MICRO-COMMERCIAL-COMPONENTS",
      name: "MICRO COMMERCIAL COMPONENTS",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Rectifiers",
      riskScore: 68,
      primaryImpact: "Delivery",
      revenueAtRisk: 1.943,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Rectifiers. 6 parts across 704 assemblies.",
      children: []
    },
    {
      id: "T1-MERITEK",
      name: "MERITEK",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "CAPACITOR",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 1.859,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for CAPACITOR. 2 parts across 477 assemblies.",
      children: []
    },
    {
      id: "T1-COILCRAFT",
      name: "COILCRAFT",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Fixed Inductors",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 1.8,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 5 parts across 693 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-CIRCUIT-ASSY",
      name: "CIRCUIT ASSY",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Rectangular Connector Headers and Receptacles",
      riskScore: 80,
      primaryImpact: "Cost",
      revenueAtRisk: 1.779,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Rectangular Connector Headers and Receptacles. 4 parts across 520 assemblies.",
      children: []
    },
    {
      id: "T1-WINBOND",
      name: "WINBOND",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Flash Memories",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 1.777,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Flash Memories. 3 parts across 456 assemblies.",
      children: []
    },
    {
      id: "T1-ANALOG-DEVICES",
      name: "ANALOG DEVICES",
      tier: 1,
      location: {
        city: "Wilmington",
        country: "USA"
      },
      commodity: "Digital Signal Processors (DSP)",
      riskScore: 73,
      primaryImpact: "Delivery",
      revenueAtRisk: 1.774,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Digital Signal Processors (DSP). 4 parts across 586 assemblies.",
      children: []
    },
    {
      id: "T1-WURTH-ELECTRONIK",
      name: "WURTH ELECTRONIK",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Aluminum Electrolytic Capacitors",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 1.746,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 2 parts across 672 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-THERMO-COOL",
      name: "THERMO COOL",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "METAL",
      riskScore: 88,
      primaryImpact: "Cost",
      revenueAtRisk: 1.625,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for METAL. 3 parts across 417 assemblies.",
      children: []
    },
    {
      id: "T1-ZIERICK",
      name: "ZIERICK",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "CONNECTOR",
      riskScore: 88,
      primaryImpact: "Cost",
      revenueAtRisk: 1.609,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for CONNECTOR. 1 parts across 413 assemblies.",
      children: []
    },
    {
      id: "T1-SCHURTER",
      name: "SCHURTER",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Power Entry Connectors",
      riskScore: 80,
      primaryImpact: "Cost",
      revenueAtRisk: 1.573,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Power Entry Connectors. 4 parts across 460 assemblies.",
      children: []
    },
    {
      id: "T1-VTECH-SBU6",
      name: "VTECH (SBU6)",
      tier: 1,
      location: {
        city: "Dongguan",
        country: "China"
      },
      commodity: "METAL",
      riskScore: 55,
      primaryImpact: "Cost",
      revenueAtRisk: 1.507,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 9 parts across 580 assemblies; multi-sourced.",
      children: [
        {
          id: "T2-VTECH-COMMUNICATIONS-LTD",
          name: "VTech Communications Ltd",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "PLASTIC",
          riskScore: 76,
          primaryImpact: "Cost",
          revenueAtRisk: 21.648,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through VTech Communications Ltd. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-PENCOM",
      name: "PENCOM",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "HARDWARE",
      riskScore: 55,
      primaryImpact: "Cost",
      revenueAtRisk: 1.475,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 7 parts across 568 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-TDK",
      name: "TDK",
      tier: 1,
      location: {
        city: "Tokyo",
        country: "Japan"
      },
      commodity: "Ceramic Capacitors",
      riskScore: 59,
      primaryImpact: "Delivery",
      revenueAtRisk: 1.473,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 6 parts across 567 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-NICHICON",
      name: "NICHICON",
      tier: 1,
      location: {
        city: "Kyoto",
        country: "Japan"
      },
      commodity: "Aluminum Electrolytic Capacitors",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 1.439,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 4 parts across 554 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-LAMCOR",
      name: "LAMCOR",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "WIRE/CABLE",
      riskScore: 88,
      primaryImpact: "Cost",
      revenueAtRisk: 1.375,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for WIRE/CABLE. 4 parts across 353 assemblies.",
      children: []
    },
    {
      id: "T1-TOPSEARCH",
      name: "TOPSEARCH",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "PCB",
      riskScore: 78,
      primaryImpact: "Cost",
      revenueAtRisk: 1.243,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 7 parts across 319 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-ZETEX",
      name: "ZETEX",
      tier: 1,
      location: {
        city: "Oldham",
        country: "UK"
      },
      commodity: "Voltage References",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 1.224,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Voltage References. 1 parts across 314 assemblies.",
      children: [
        {
          id: "T2-DIODES-INCORPORATED",
          name: "Diodes Incorporated",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Rectifiers",
          riskScore: 70,
          primaryImpact: "Delivery",
          revenueAtRisk: 7.851,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through Diodes Incorporated. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-MOLEX",
      name: "MOLEX",
      tier: 1,
      location: {
        city: "Lisle",
        country: "USA"
      },
      commodity: "FFC / FPC Connectors",
      riskScore: 48,
      primaryImpact: "Cost",
      revenueAtRisk: 1.09,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 8 parts across 485 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-PANDUIT",
      name: "PANDUIT",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Cable Ties",
      riskScore: 55,
      primaryImpact: "Cost",
      revenueAtRisk: 1.088,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 2 parts across 419 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-GABOUKEJI",
      name: "GABOUKEJI",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "SWITCH",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 1.056,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for SWITCH. 1 parts across 271 assemblies.",
      children: []
    },
    {
      id: "T1-JOHANSON-DIELECTRICS",
      name: "JOHANSON DIELECTRICS",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Ceramic Capacitors",
      riskScore: 80,
      primaryImpact: "Delivery",
      revenueAtRisk: 1.048,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Ceramic Capacitors. 2 parts across 306 assemblies.",
      children: []
    },
    {
      id: "T1-LAIRD-TECHNOLOGIES",
      name: "LAIRD TECHNOLOGIES",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Ferrite Beads",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.99,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 2 parts across 381 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-UNITED-CHEMI-CON",
      name: "UNITED CHEMI-CON",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Aluminum Electrolytic Capacitors",
      riskScore: 81,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.97,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Aluminum Electrolytic Capacitors. 3 parts across 278 assemblies.",
      children: []
    },
    {
      id: "T1-MICROCHIP-TECHNOLOGY",
      name: "MICROCHIP TECHNOLOGY",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Analog to Digital Converters (ADCs)",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.94,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Analog to Digital Converters (ADCs).",
      children: []
    },
    {
      id: "T1-INFINEX",
      name: "INFINEX",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "HARDWARE",
      riskScore: 88,
      primaryImpact: "Cost",
      revenueAtRisk: 0.935,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for HARDWARE. 1 parts across 240 assemblies.",
      children: []
    },
    {
      id: "T1-SMC-DIODES",
      name: "SMC DIODES",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Rectifiers",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.86,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Rectifiers.",
      children: []
    },
    {
      id: "T1-FUJIPOLY",
      name: "FUJIPOLY",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Thermal Interface Products",
      riskScore: 78,
      primaryImpact: "Compliance",
      revenueAtRisk: 0.833,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Thermal Interface Products. 2 parts across 251 assemblies.",
      children: []
    },
    {
      id: "T1-WOLFSPEED",
      name: "WOLFSPEED",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Rectifiers",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.813,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Rectifiers.",
      children: [
        {
          id: "T2-WOLFSPEED-INC",
          name: "Wolfspeed, Inc.",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Rectifiers",
          riskScore: 65,
          primaryImpact: "Delivery",
          revenueAtRisk: 1.166,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through Wolfspeed, Inc.. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-TAIWAN-SEMICONDUCTOR-CO-LTD",
      name: "TAIWAN SEMICONDUCTOR CO., LTD",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Rectifiers",
      riskScore: 59,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.795,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 4 parts across 306 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-LMI-COMPONENTS",
      name: "LMI COMPONENTS",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Terminal Block Headers and Receptacles",
      riskScore: 88,
      primaryImpact: "Cost",
      revenueAtRisk: 0.772,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Terminal Block Headers and Receptacles. 2 parts across 198 assemblies.",
      children: []
    },
    {
      id: "T1-RECTRON",
      name: "RECTRON",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Bridge Rectifiers",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.772,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Bridge Rectifiers. 2 parts across 198 assemblies.",
      children: []
    },
    {
      id: "T1-SEMTECH",
      name: "SEMTECH",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Transient Voltage Suppressors (TVS)",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.768,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Transient Voltage Suppressors (TVS). 1 parts across 197 assemblies.",
      children: []
    },
    {
      id: "T1-BI-TECHNOLOGIES",
      name: "BI TECHNOLOGIES",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Encoders",
      riskScore: 65,
      primaryImpact: "Compliance",
      revenueAtRisk: 0.764,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Encoders.",
      children: []
    },
    {
      id: "T1-KEC",
      name: "KEC",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Linear Voltage Regulators",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.727,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Linear Voltage Regulators.",
      children: []
    },
    {
      id: "T1-KNOWLES-SYFER",
      name: "KNOWLES SYFER",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Ceramic Capacitors",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.722,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 2 parts across 278 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-ABRACON",
      name: "ABRACON",
      tier: 1,
      location: {
        city: "Spicewood",
        country: "USA"
      },
      commodity: "Fixed Inductors",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.701,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Fixed Inductors.",
      children: [
        {
          id: "T2-ABRACON-LLC",
          name: "Abracon LLC.",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Crystals",
          riskScore: 65,
          primaryImpact: "Delivery",
          revenueAtRisk: 1.13,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through Abracon LLC.. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-CIRRUS",
      name: "CIRRUS",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "CODECs",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.678,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for CODECs. 1 parts across 174 assemblies.",
      children: []
    },
    {
      id: "T1-RENESAS",
      name: "RENESAS",
      tier: 1,
      location: {
        city: "Tokyo",
        country: "Japan"
      },
      commodity: "Analog Switch Multiplexers",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.668,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 50% single-sourced. Review dual-source options for Analog Switch Multiplexers.",
      children: [
        {
          id: "T2-RENESAS-ELECTRONICS-CORPORATION",
          name: "Renesas Electronics Corporation",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Analog Switch Multiplexers",
          riskScore: 65,
          primaryImpact: "Delivery",
          revenueAtRisk: 1.029,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through Renesas Electronics Corporation. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-MICRON",
      name: "MICRON",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Flash Memories",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.655,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 50% single-sourced. Review dual-source options for Flash Memories.",
      children: []
    },
    {
      id: "T1-TE-CONNECTIVITY",
      name: "TE CONNECTIVITY",
      tier: 1,
      location: {
        city: "Schaffhausen",
        country: "Switzerland"
      },
      commodity: "Chip Resistors",
      riskScore: 54,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.653,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 4 parts across 257 assemblies; multi-sourced.",
      children: [
        {
          id: "T2-LITTELFUSE-INC",
          name: "Littelfuse, Inc.",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Fuses",
          riskScore: 68,
          primaryImpact: "Compliance",
          revenueAtRisk: 3.687,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 3 tier-1 suppliers route through Littelfuse, Inc.. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-GLOBAL-MANUFACTURING-NETWORK",
      name: "GLOBAL MANUFACTURING NETWORK",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "METAL",
      riskScore: 65,
      primaryImpact: "Cost",
      revenueAtRisk: 0.623,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for METAL.",
      children: []
    },
    {
      id: "T1-OUPIIN",
      name: "OUPIIN",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Rectangular Connector Headers and Receptacles",
      riskScore: 84,
      primaryImpact: "Cost",
      revenueAtRisk: 0.607,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Rectangular Connector Headers and Receptacles. 2 parts across 164 assemblies.",
      children: []
    },
    {
      id: "T1-GOOD-ARK",
      name: "GOOD ARK",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Rectifiers",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.604,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Rectifiers. 2 parts across 155 assemblies.",
      children: []
    },
    {
      id: "T1-FARATRONIC",
      name: "FARATRONIC",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Film Capacitors",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.542,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Film Capacitors. 1 parts across 139 assemblies.",
      children: []
    },
    {
      id: "T1-ALLEGRO",
      name: "ALLEGRO",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Current Sensor ICs",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.542,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Current Sensor ICs. 1 parts across 139 assemblies.",
      children: []
    },
    {
      id: "T1-AMERICAN-ZETTLER",
      name: "AMERICAN ZETTLER",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Power Relays",
      riskScore: 78,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.542,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 139 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-NXP",
      name: "NXP",
      tier: 1,
      location: {
        city: "Eindhoven",
        country: "Netherlands"
      },
      commodity: "Microcontrollers (MCU)",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.53,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Microcontrollers (MCU).",
      children: []
    },
    {
      id: "T1-CYPRESS",
      name: "CYPRESS",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Clock Generators and Synthesizers",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.514,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Clock Generators and Synthesizers. 1 parts across 132 assemblies.",
      children: [
        {
          id: "T2-INFINEON-TECHNOLOGIES-AG",
          name: "Infineon Technologies AG",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "MOSFETs",
          riskScore: 72,
          primaryImpact: "Delivery",
          revenueAtRisk: 2.834,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through Infineon Technologies AG. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-SKYWORKS",
      name: "SKYWORKS",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Audio Special Purpose",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.509,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 196 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-TOSHIBA",
      name: "TOSHIBA",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "MOSFETs",
      riskScore: 65,
      primaryImpact: "Compliance",
      revenueAtRisk: 0.501,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 66% single-sourced. Review dual-source options for MOSFETs.",
      children: []
    },
    {
      id: "T1-VISHAY-DALE",
      name: "VISHAY DALE",
      tier: 1,
      location: {
        city: "Columbus",
        country: "USA"
      },
      commodity: "Fixed Inductors",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.499,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Fixed Inductors. 1 parts across 128 assemblies.",
      children: [
        {
          id: "T2-VISHAY-INTERTECHNOLOGY-INC",
          name: "Vishay Intertechnology, Inc.",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Chip Resistors",
          riskScore: 52,
          primaryImpact: "Delivery",
          revenueAtRisk: 11.99,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through Vishay Intertechnology, Inc.. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-CASIL",
      name: "CASIL",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "DISPLAY",
      riskScore: 88,
      primaryImpact: "Compliance",
      revenueAtRisk: 0.491,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for DISPLAY. 1 parts across 126 assemblies.",
      children: []
    },
    {
      id: "T1-ELYTONE-ELECTRONIC-CO-LTD",
      name: "ELYTONE ELECTRONIC CO LTD",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "INDUCTOR",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.475,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for INDUCTOR. 3 parts across 122 assemblies.",
      children: []
    },
    {
      id: "T1-OMRON",
      name: "OMRON",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Signal Relays",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.475,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 2 parts across 183 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-HOLYSTONE",
      name: "HOLYSTONE",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Ceramic Capacitors",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.433,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Ceramic Capacitors. 1 parts across 111 assemblies.",
      children: []
    },
    {
      id: "T1-ILSI-AMERICA-INC",
      name: "ILSI AMERICA INC.",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Crystals",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.429,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Crystals.",
      children: [
        {
          id: "T2-ABRACON-LLC",
          name: "Abracon LLC.",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Crystals",
          riskScore: 65,
          primaryImpact: "Delivery",
          revenueAtRisk: 1.13,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through Abracon LLC.. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-NEUTRIK",
      name: "NEUTRIK",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Circular Connectors",
      riskScore: 65,
      primaryImpact: "Cost",
      revenueAtRisk: 0.423,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Circular Connectors.",
      children: []
    },
    {
      id: "T1-TRANSKO",
      name: "TRANSKO",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Crystal Oscillators",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.417,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Crystal Oscillators. 1 parts across 107 assemblies.",
      children: []
    },
    {
      id: "T1-KAMAYA-OHM",
      name: "KAMAYA OHM",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Chip Resistors",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.403,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Chip Resistors.",
      children: []
    },
    {
      id: "T1-COOLTRON",
      name: "COOLTRON",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Fans",
      riskScore: 88,
      primaryImpact: "Compliance",
      revenueAtRisk: 0.401,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Fans. 1 parts across 103 assemblies.",
      children: []
    },
    {
      id: "T1-MPS-MONOLITHIC-POWER-SYSTEMS",
      name: "MPS (MONOLITHIC POWER SYSTEMS)",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Special Purpose Voltage Regulators",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.397,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 153 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-SILICON-LABORATORIES",
      name: "SILICON LABORATORIES",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Interface Controllers",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.397,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Interface Controllers. 1 parts across 102 assemblies.",
      children: []
    },
    {
      id: "T1-ETRON-TECHNOLOGY",
      name: "ETRON TECHNOLOGY",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "DRAM",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.394,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for DRAM. 1 parts across 101 assemblies.",
      children: []
    },
    {
      id: "T1-BEL-FUSE",
      name: "BEL FUSE",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Pulse Transformers",
      riskScore: 88,
      primaryImpact: "Compliance",
      revenueAtRisk: 0.394,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Pulse Transformers. 1 parts across 101 assemblies.",
      children: []
    },
    {
      id: "T1-LANXIN",
      name: "LANXIN",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "GASKET",
      riskScore: 88,
      primaryImpact: "Cost",
      revenueAtRisk: 0.382,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for GASKET. 1 parts across 98 assemblies.",
      children: []
    },
    {
      id: "T1-RICHER",
      name: "RICHER",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Flat Ribbon Cables",
      riskScore: 88,
      primaryImpact: "Cost",
      revenueAtRisk: 0.378,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Flat Ribbon Cables. 1 parts across 97 assemblies.",
      children: []
    },
    {
      id: "T1-EPCOS",
      name: "EPCOS",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Film Capacitors",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.361,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 139 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-POWER-INTEGRATIONS",
      name: "POWER INTEGRATIONS",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Off-Line Converters and Switches",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.361,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 139 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-NEC",
      name: "NEC",
      tier: 1,
      location: {
        city: "Tokyo",
        country: "Japan"
      },
      commodity: "Opto-couplers",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.361,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Opto-couplers.",
      children: [
        {
          id: "T2-RENESAS-ELECTRONICS-CORPORATION",
          name: "Renesas Electronics Corporation",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Analog Switch Multiplexers",
          riskScore: 65,
          primaryImpact: "Delivery",
          revenueAtRisk: 1.029,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through Renesas Electronics Corporation. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-IXYS",
      name: "IXYS",
      tier: 1,
      location: {
        city: "Milpitas",
        country: "USA"
      },
      commodity: "Rectifiers",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.361,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 139 assemblies; multi-sourced.",
      children: [
        {
          id: "T2-LITTELFUSE-INC",
          name: "Littelfuse, Inc.",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Fuses",
          riskScore: 68,
          primaryImpact: "Compliance",
          revenueAtRisk: 3.687,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 3 tier-1 suppliers route through Littelfuse, Inc.. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-AMETHERM",
      name: "AMETHERM",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Inrush Current Limiters",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.361,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Inrush Current Limiters.",
      children: []
    },
    {
      id: "T1-RCD-COMPONENTS",
      name: "RCD COMPONENTS",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Through Hole Resistors",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.361,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Through Hole Resistors.",
      children: []
    },
    {
      id: "T1-CREE",
      name: "CREE",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Rectifiers",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.353,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Rectifiers.",
      children: [
        {
          id: "T2-WOLFSPEED-INC",
          name: "Wolfspeed, Inc.",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Rectifiers",
          riskScore: 65,
          primaryImpact: "Delivery",
          revenueAtRisk: 1.166,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through Wolfspeed, Inc.. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-AMPHENOL",
      name: "AMPHENOL",
      tier: 1,
      location: {
        city: "Wallingford",
        country: "USA"
      },
      commodity: "Rectangular Connector Headers and Receptacles",
      riskScore: 78,
      primaryImpact: "Cost",
      revenueAtRisk: 0.335,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 86 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-KEYSTONE",
      name: "KEYSTONE",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Screw Terminals",
      riskScore: 55,
      primaryImpact: "Cost",
      revenueAtRisk: 0.304,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 2 parts across 117 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-LATTICE-SEMICONDUCTORS",
      name: "LATTICE SEMICONDUCTORS",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Field Programmable Gate Arrays (FPGAs)",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.304,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Field Programmable Gate Arrays (FPGAs).",
      children: []
    },
    {
      id: "T1-TOWNES-ENTERPRISE",
      name: "TOWNES ENTERPRISE",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "CONNECTOR",
      riskScore: 55,
      primaryImpact: "Cost",
      revenueAtRisk: 0.268,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 103 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-AMS-AG",
      name: "AMS AG",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Display Drivers and Controllers",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.262,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Display Drivers and Controllers.",
      children: []
    },
    {
      id: "T1-ALLIED-COMPONENT",
      name: "ALLIED COMPONENT",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Fixed Inductors",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.257,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 99 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-SUNTAK",
      name: "SUNTAK",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "PCB",
      riskScore: 55,
      primaryImpact: "Cost",
      revenueAtRisk: 0.252,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 97 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-ORION-FANS",
      name: "ORION FANS",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Fan Filters and Finger Guards",
      riskScore: 55,
      primaryImpact: "Cost",
      revenueAtRisk: 0.247,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 95 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-ZHONGJIA-PRINTING-CO",
      name: "ZHONGJIA PRINTING CO",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "PLASTIC",
      riskScore: 65,
      primaryImpact: "Cost",
      revenueAtRisk: 0.247,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for PLASTIC.",
      children: []
    },
    {
      id: "T1-AKM",
      name: "AKM",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Special Purpose Data Converters",
      riskScore: 65,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.234,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for Special Purpose Data Converters.",
      children: []
    },
    {
      id: "T1-CORNELL-DUBILIER",
      name: "CORNELL DUBILIER",
      tier: 1,
      location: {
        city: "Liberty",
        country: "USA"
      },
      commodity: "Film Capacitors",
      riskScore: 30,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.226,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 2 parts across 174 assemblies; multi-sourced.",
      children: [
        {
          id: "T2-CORNELL-DUBILIER-ELECTRONICS-CDE",
          name: "Cornell Dubilier Electronics (CDE)",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Aluminum Electrolytic Capacitors",
          riskScore: 36,
          primaryImpact: "Delivery",
          revenueAtRisk: 0.366,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through Cornell Dubilier Electronics (CDE). Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-PANJIT",
      name: "PANJIT",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Rectifiers",
      riskScore: 68,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.225,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Rectifiers. 2 parts across 81 assemblies.",
      children: []
    },
    {
      id: "T1-CAL-CHIP",
      name: "CAL CHIP",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Chip Resistors",
      riskScore: 30,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.221,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 170 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-RUBYCON",
      name: "RUBYCON",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Aluminum Electrolytic Capacitors",
      riskScore: 30,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.213,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 2 parts across 164 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-THINKING-ELECTRONIC-INDUSTRIAL",
      name: "THINKING ELECTRONIC INDUSTRIAL",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "NTC Thermistors",
      riskScore: 78,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.203,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 52 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-CTS",
      name: "CTS",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Network and Array Resistors",
      riskScore: 30,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.203,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 156 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-CINETECH-LAUBE",
      name: "CINETECH (LAUBE)",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "CAPACITOR",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.192,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 74 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-LONGAN-YUE-INDUSTRIAL",
      name: "LONGAN YUE INDUSTRIAL",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "HARDWARE",
      riskScore: 55,
      primaryImpact: "Cost",
      revenueAtRisk: 0.177,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 68 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-SAMTEC",
      name: "SAMTEC",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Flat Ribbon Cables",
      riskScore: 30,
      primaryImpact: "Cost",
      revenueAtRisk: 0.158,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 122 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-WIMA",
      name: "WIMA",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Film Capacitors",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.14,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 54 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-CDE-MALLORY",
      name: "CDE/MALLORY",
      tier: 1,
      location: {
        city: "Liberty",
        country: "USA"
      },
      commodity: "Aluminum Electrolytic Capacitors",
      riskScore: 55,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.14,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 54 assemblies; multi-sourced.",
      children: [
        {
          id: "T2-CORNELL-DUBILIER-ELECTRONICS-CDE",
          name: "Cornell Dubilier Electronics (CDE)",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Aluminum Electrolytic Capacitors",
          riskScore: 36,
          primaryImpact: "Delivery",
          revenueAtRisk: 0.366,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through Cornell Dubilier Electronics (CDE). Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-VALUEHD",
      name: "VALUEHD",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "PACKAGING",
      riskScore: 88,
      primaryImpact: "Cost",
      revenueAtRisk: 0.109,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for PACKAGING. 8 parts across 28 assemblies.",
      children: []
    },
    {
      id: "T1-PHOENIX-CONTACT",
      name: "PHOENIX CONTACT",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "Terminal Block Headers and Receptacles",
      riskScore: 55,
      primaryImpact: "Cost",
      revenueAtRisk: 0.099,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 2 parts across 38 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-SHENZHEN-LOSANG-PRECISION-INDU",
      name: "SHENZHEN LOSANG PRECISION INDU",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "PLASTIC",
      riskScore: 88,
      primaryImpact: "Cost",
      revenueAtRisk: 0.086,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for PLASTIC. 1 parts across 22 assemblies.",
      children: []
    },
    {
      id: "T1-LOVEPAC",
      name: "LOVEPAC",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "PACKAGING",
      riskScore: 65,
      primaryImpact: "Cost",
      revenueAtRisk: 0.07,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "SNG",
      topRiskLensLabel: "Sourcing Concentration",
      action: "Sourcing concentration \u2014 100% single-sourced. Review dual-source options for PACKAGING.",
      children: []
    },
    {
      id: "T1-PULSE-ENGINEERING",
      name: "PULSE ENGINEERING",
      tier: 1,
      location: {
        city: "San Diego",
        country: "USA"
      },
      commodity: "Power and Coupled Inductors",
      riskScore: 88,
      primaryImpact: "Delivery",
      revenueAtRisk: 0.043,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: "SPF",
      topRiskLensLabel: "Single-Source Continuity",
      action: "Single-source risk \u2014 qualify a second source for Power and Coupled Inductors. 1 parts across 11 assemblies.",
      children: [
        {
          id: "T2-YAGEO-CORPORATION",
          name: "YAGEO Corporation",
          tier: 2,
          location: {
            city: "\u2014",
            country: "Global"
          },
          commodity: "Chip Resistors",
          riskScore: 58,
          primaryImpact: "Delivery",
          revenueAtRisk: 9.676,
          isSPOF: false,
          isChokePoint: true,
          topRiskLens: "CHK",
          topRiskLensLabel: "Convergence / Sub-tier concentration",
          action: "Convergence point \u2014 2 tier-1 suppliers route through YAGEO Corporation. Assess concentration; map alternate sub-tier capacity.",
          children: []
        }
      ]
    },
    {
      id: "T1-WINSTAR",
      name: "WINSTAR",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "DISPLAY",
      riskScore: 55,
      primaryImpact: "Compliance",
      revenueAtRisk: 0.026,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 10 assemblies; multi-sourced.",
      children: []
    },
    {
      id: "T1-MEAN-WELL",
      name: "MEAN WELL",
      tier: 1,
      location: {
        city: "\u2014",
        country: "Global"
      },
      commodity: "AC/DC Converters (Off-Board Mount)",
      riskScore: 55,
      primaryImpact: "Compliance",
      revenueAtRisk: 0.026,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: "CAP",
      topRiskLensLabel: "Capacity / Demand",
      action: "Monitor \u2014 1 parts across 10 assemblies; multi-sourced.",
      children: []
    }
  ]
};
