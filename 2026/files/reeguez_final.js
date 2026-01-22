const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, 
        AlignmentType, PageBreak, LevelFormat, HeadingLevel, BorderStyle, WidthType, 
        ShadingType, PageNumber } = require('docx');
const fs = require('fs');

// Styling constants
const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };
const headerFill = { fill: "2B5797", type: ShadingType.CLEAR };
const altRowFill = { fill: "F2F2F2", type: ShadingType.CLEAR };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 48, bold: true, color: "2B5797", font: "Arial" },
        paragraph: { spacing: { before: 0, after: 200 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: "2B5797", font: "Arial" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: "404040", font: "Arial" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, color: "404040", font: "Arial" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-1", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-3", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-4", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-5", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Reeguez Rocks 2026 - Planning Document", size: 18, color: "808080" })] })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Page ", size: 18 }), new TextRun({ children: [PageNumber.CURRENT], size: 18 }), new TextRun({ text: " of ", size: 18 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 })] })] })
    },
    children: [
      // TITLE PAGE
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("REEGUEZ ROCKS 2026")] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Bass & Dubstep Camping Festival", size: 28, italics: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Camp Tahquitz • San Bernardino Mountains • October 2026", size: 24 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "18+ Event", size: 22, bold: true })] }),

      // EVENT SUMMARY
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Event Summary")] }),
      
      new Table({
        columnWidths: [3200, 6160],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Event Name", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6160, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Reeguez Rocks 2026")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Genre", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6160, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Bass music and dubstep")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Dates", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6160, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("October 2026 (Wednesday arrival through Monday sunrise)")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Music Schedule", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6160, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Thursday afternoon through Monday sunrise (4 music days)")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Location", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6160, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Camp Tahquitz, 41700 State Highway 38, Angelus Oaks, CA 92305")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Venue Size", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6160, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("640 acres of forestland at 6,500 feet elevation")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Capacity", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6160, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("100 minimum, scalable to several thousand")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Age Requirement", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6160, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("18+")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "2025 Baseline", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6160, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("~80 attendees, $3,000 production budget")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "October Weather", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6160, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Days 60-70°F, nights 35-45°F (attendees must bring warm layers)")] })] }),
          ]}),
        ]
      }),

      new Paragraph({ spacing: { before: 300 }, children: [new TextRun("Reeguez Rocks is a wook-friendly mountain gathering focused on bass music, flow arts, and community camping. The 2026 edition builds on the 2025 foundation with expanded production, additional stages, and enhanced daytime programming.")] }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // VENUE
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Venue: Camp Tahquitz")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Venue Contact")] }),
      new Paragraph({ children: [new TextRun({ text: "Kevin D. Folkerts", bold: true }), new TextRun(", Council Program Director")] }),
      new Paragraph({ children: [new TextRun("401 E 37th St, Long Beach, CA 90807")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun("Direct: 562-684-3156 | Cell: 562-900-3406")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Venue Payment Structure")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun("$10 per ticket per music day goes to the venue. Payment scales with attendance and ticket type:")] }),

      new Table({
        columnWidths: [4680, 2340, 2340],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ticket Type", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Music Days", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Venue Payment", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("4-Day Pass")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("4")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$40")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("3-Day Pass")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("3")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$30")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("2-Day Pass")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("2")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$20")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("1-Day Pass")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("1")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$10")] })] }),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Venue Facilities")] }),

      new Table({
        columnWidths: [2800, 3280, 3280],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Facility", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Festival Use", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Revenue Opportunity", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Heated Swimming Pool", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Daytime recovery, Tribe lifeguards staff 12-6pm")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Included in GA - major selling point")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Munzer Lake", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Scenic backdrop, potential canoe/kayak")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Included in GA")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "C.L. Appling Campfire Bowl", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Natural amphitheater for acoustic/downtempo sets")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Third stage at zero additional cost")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Kiwanis Lodge", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Artist green room, VIP lounge, vendor HQ")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Operations hub")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Commercial Kitchen", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Meal prep for staff/artists, meal plan program")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("$900-2,100 from meal plan sales")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "9-Person Cabins", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Premium lodging, artist/staff housing")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("$1,000/cabin × 6 = $6,000 max")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Historic Log Cabins (4)", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Workshops: yoga, sound healing, meet-and-greets")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Trade ticket for session = zero cost")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Activity Field", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Main stage area, art installations, flow space")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Primary production area")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Zip Line", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Daytime activity, Tribe staffed")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("$5-10/ride, split with Tribe")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Climbing Wall / COPE", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Daytime activity, Tribe staffed")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("$5-10/session, split with Tribe")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "640 Acres / Trails", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Daytime exploration, nature walks, art trail")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3280, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Included in GA")] })] }),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Venue Restrictions")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "No wood campfires. ", bold: true }), new TextRun("Propane/butane stoves permitted. Fire rings only if approved by Camp Director.")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "High fire danger area. ", bold: true }), new TextRun("No fireworks.")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Bear country. ", bold: true }), new TextRun("Bear boxes in each campsite. No food in tents. Commissary can store coolers overnight.")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Leave No Trace required. ", bold: true }), new TextRun("Pack out all trash. Leave cleaner than found.")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Insurance requirement. ", bold: true }), new TextRun("$2,000,000 policy with Camp Tahquitz named as Additional Insured.")] }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // TRIBE OF TAHQUITZ PARTNERSHIP
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Tribe of Tahquitz Partnership")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun("The Tribe of Tahquitz is the volunteer organization that staffs Camp Tahquitz summer programs. This partnership unlocks staffed daytime activities while keeping liability with trained operators.")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Age Requirements")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun("Reeguez Rocks is an 18+ event. Tribesman ages 18-21 may participate as staff volunteers. Honorary Tribe members can be offered attendance in exchange for help. Under-18 Tribe members cannot attend.")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Partnership Structure")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Eligible Tribe members (18+) staff pool lifeguard shifts, zip line, climbing wall during daytime hours")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("In exchange: free admission for staff volunteers")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Optional: donation to Tribe of Tahquitz as goodwill gesture")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Optional: small activity fees ($5-10 for zip line) with proceeds split between event and Tribe")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Liability for activities stays with trained Tribe operators")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Activities Tribe Can Staff")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Pool lifeguard (12-6pm daily)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Zip line sessions")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Climbing wall / COPE course")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Lake activities (canoe/kayak if available)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Archery (if interest warrants)")] }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // TICKET PRICING
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Ticket Pricing")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("General Admission")] }),
      new Table({
        columnWidths: [3120, 1560, 1560, 1560, 1560],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ticket Type", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Price", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "To Venue", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Margin", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Music Days", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("4-Day Pass")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$99")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$40")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$59", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Thu-Mon")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("3-Day Pass")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$80")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$30")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$50", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Fri-Mon")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("2-Day Pass")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$60")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$20")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$40", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Sat-Sun")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("1-Day Pass")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$30")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$10")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$20", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Single day")] })] }),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Add-On Packages")] }),
      new Table({
        columnWidths: [4680, 2340, 2340],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Add-On", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Price", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Availability", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Car Camping")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$30")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Unlimited")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Cabin Reservation (up to 9 beds)")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("6 cabins")] })] }),
          ]}),
        ]
      }),
      new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "Note: ", bold: true }), new TextRun("Add-on fees are 100% margin. Additional cabins reserved for artists and staff.")] }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // CROWDFUNDING TIERS
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Crowdfunding Tiers")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun("The tier structure scales from a minimum viable event (~150 attendees) to a full festival experience (1,500 attendees). Ticket sales and crowdfunding contributions combine to unlock each tier.")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Phase 1: Foundation (Tiers 1-3)")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Target: 150-200 attendees", italics: true })] }),
      new Table({
        columnWidths: [1200, 1800, 1800, 4560],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tier", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Goal", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cumulative", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "What It Unlocks", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$3,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$3,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "EVENT COMMITTED. ", bold: true }), new TextRun("Insurance, fuel, U-Hauls, contingency")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "2", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$5,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$8,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "First headliner budget. ", bold: true }), new TextRun("Book a name, announce on flyer")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$3,900")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$11,900")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Basic production. ", bold: true }), new TextRun("Subphonic ($3,000) + Keith's dome ($900)")] })] }),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 400 }, children: [new TextRun("Phase 2: Growth (Tiers 4-7)")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Target: 300-500 attendees", italics: true })] }),
      new Table({
        columnWidths: [1200, 1800, 1800, 4560],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tier", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Goal", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cumulative", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "What It Unlocks", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "4", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$3,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$14,900")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Subphonic upgraded. ", bold: true }), new TextRun("+$3k, now $6k total budget")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$3,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$17,900")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Festival ambiance. ", bold: true }), new TextRun("Lighting, projectors, decor, amenities")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "6", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$5,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$22,900")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Second headliner. ", bold: true }), new TextRun("Another name act for lineup diversity")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "7", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$2,500")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$25,400")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Daytime programming. ", bold: true }), new TextRun("Yoga, sound baths, workshops")] })] }),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 400 }, children: [new TextRun("Phase 3: Expansion (Tiers 8-11)")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Target: 500-800 attendees", italics: true })] }),
      new Table({
        columnWidths: [1200, 1800, 1800, 4560],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tier", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Goal", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cumulative", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "What It Unlocks", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "8", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$3,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$28,400")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Subphonic premium. ", bold: true }), new TextRun("+$3k, now $9k total budget")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "9", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$5,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$33,400")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Third headliner + support acts. ", bold: true }), new TextRun("Fill out the lineup")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "10", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$5,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$38,400")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Main stage visuals. ", bold: true }), new TextRun("LED wall, expanded lighting rig")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "11", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$5,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$43,400")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Art + Infrastructure. ", bold: true }), new TextRun("Installations, fencing, signage, power")] })] }),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 400 }, children: [new TextRun("Phase 4: Festival Scale (Tiers 12-15)")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Target: 1,000-1,500 attendees", italics: true })] }),
      new Table({
        columnWidths: [1200, 1800, 1800, 4560],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tier", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Goal", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cumulative", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "What It Unlocks", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "12", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$3,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$46,400")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Subphonic festival-grade. ", bold: true }), new TextRun("+$3k, now $12k total budget")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "13", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$10,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$56,400")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Major headliner. ", bold: true }), new TextRun("Marquee name to anchor the lineup")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "14", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$8,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$64,400")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Full support lineup. ", bold: true }), new TextRun("4-6 additional mid-tier acts")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "15", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$10,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$74,400")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Premium package. ", bold: true }), new TextRun("Enhanced PA, aftermovie, medical, security")] })] }),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 400 }, children: [new TextRun("Tier Breakdown by Category")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Artists (Total: $38,000)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 2: $5,000 - First headliner")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 6: $5,000 - Second headliner")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 9: $5,000 - Third headliner + support")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 12: $10,000 - Major headliner")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 14: $8,000 - Full support lineup (4-6 mid-tier)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("+ Local DJs at reduced/trade rates throughout")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Production (Total: $17,900)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 3: $3,900 - Subphonic basic ($3k) + Keith's dome ($900)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 4: $3,000 - Subphonic upgraded (+$3k, now $6k total)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 8: $3,000 - Subphonic premium (+$3k, now $9k total)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 10: $5,000 - Main stage visuals (LED wall, expanded lighting)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 12: $3,000 - Subphonic festival-grade (+$3k, now $12k total)")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Experience (Total: $15,500)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 5: $3,000 - Festival ambiance (lighting, projectors, decor)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 7: $2,500 - Daytime programming (yoga, workshops)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 15: $10,000 - Premium package (enhanced PA, aftermovie, medical, security)")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Infrastructure (Total: $8,000)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 1: $3,000 - Insurance, fuel, U-Hauls, contingency")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier 11: $5,000 - Art installations, fencing, signage, power")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 300 }, children: [new TextRun("Revenue Required by Phase")] }),
      new Table({
        columnWidths: [2340, 2340, 2340, 2340],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Phase", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cumulative Goal", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "4-Day Tickets*", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Target Attendance", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Phase 1 (Tier 3)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$11,900")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("202")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("150-200")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Phase 2 (Tier 7)")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$25,400")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("431")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("300-500")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Phase 3 (Tier 11)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$43,400")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("736")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("500-800")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Phase 4 (Tier 15)")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$74,400")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("1,261")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("1,000-1,500")] })] }),
          ]}),
        ]
      }),
      new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "*Based on $59 margin per 4-day pass. ", italics: true }), new TextRun({ text: "Actual revenue includes mixed ticket types, cabin sales ($6,000), car camping, and meal plans.", italics: true })] }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // KEY PARTNERS
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Key Partners")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Production: Subphonic Events")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Basic package: ", bold: true }), new TextRun("$3,000 for all 4 music days")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Upgraded package: ", bold: true }), new TextRun("+$3,000")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Payment can be deferred to prioritize artist booking")] }),
      new Paragraph({ spacing: { after: 200 }, numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Existing relationship (favorable rate due to year-round collaboration)")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Dome/Afters Stage: Keith")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Flat fee: ", bold: true }), new TextRun("$900 covers dome, setup, travel, and operation")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Keith's personal rig - he runs it exclusively")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Setup: ", bold: true }), new TextRun("5 Soundboks speakers (battery powered) + large subwoofer (generator powered)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Capacity: ", bold: true }), new TextRun("~30 people - intimate afters environment")] }),
      new Paragraph({ spacing: { after: 200 }, numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Payment can be deferred to prioritize artist booking")] }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // MEAL PLAN PROGRAM
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Meal Plan Program")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun("The commercial kitchen enables an optional meal plan program. This provides value for attendees who don't want to haul coolers up the mountain, guaranteed meals for staff and artists, and additional revenue.")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Who Gets Fed")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Staff (comped): ", bold: true }), new TextRun("Production crew, gate volunteers, cleanup crew - meals included as volunteer compensation")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Artists (comped): ", bold: true }), new TextRun("Performing artists and their +1s - meals included in booking")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Attendees (paid): ", bold: true }), new TextRun("Optional meal plan purchase during ticket checkout or on-site")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Meal Plan Packages")] }),
      new Table({
        columnWidths: [3120, 2340, 1800, 2100],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Package", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Includes", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Price", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2100, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Per Meal", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Full Festival (Thu-Mon)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("8 meals")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$100")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2100, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$12.50")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Weekend Only (Sat-Mon)")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("4 meals")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$50")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2100, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$12.50")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Single Day")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("2 meals")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$30")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2100, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$15.00")] })] }),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Service Model: Mass Serving vs Made-to-Order")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun("The commissary is designed for mass serving (cafeteria-style, feeding large groups efficiently). This works well for festival meal plans but requires planning around set meal times rather than à la carte ordering.")] }),

      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Option A: Scheduled Mass Service (Best for Commissary)", bold: true, size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Set meal times: Breakfast 9-11am, Dinner 5-7pm")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Cafeteria-line style: staff portions out food as attendees pass through")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Same menu for everyone with vegetarian/vegan options available")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Wristband system for meal plan holders")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Efficient, predictable, low waste")] }),

      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Option B: Hybrid Model", bold: true, size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Core meals (breakfast/dinner) mass-served from commissary")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Separate food vendor handles made-to-order items (late night, snacks, special requests)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Coffee/tea station available throughout the day (self-serve)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Allows flexibility while keeping meal plan costs low")] }),

      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Option C: Food Vendor Village (At Scale)", bold: true, size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("At 500+ attendees, commissary supplements rather than replaces food vendors")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Meal plan holders get vouchers redeemable at participating vendors")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Commissary focuses on staff/artist meals and bulk prep support")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("More variety, but requires vendor coordination")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Catering Vendor Partnership Options")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun("A catering partner handles food prep, serving, and cleanup using the commercial kitchen. Three deal structures are viable:")] }),

      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Option A: Revenue Split", bold: true, size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Vendor sets menu and handles all operations")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Event collects meal plan payments, takes 20-25% cut")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Vendor keeps 75-80% to cover food costs and labor")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Example: ", italics: true }), new TextRun("50 full meal plans × $120 = $6,000 gross → $1,200-1,500 to event")] }),

      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Option B: Flat Fee + Comped Meals", bold: true, size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Vendor pays flat booth fee ($200-500) for kitchen access")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Vendor provides staff/artist meals at cost (~$8-10/meal)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Vendor keeps 100% of attendee meal plan sales")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Event gets predictable fee + reduced staff meal costs")] }),

      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Option C: Guaranteed Minimum (Recommended)", bold: true, size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Event guarantees vendor minimum headcount (staff + artists + early signups)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Vendor prices meals at $10-12/meal for guaranteed group")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Event charges attendees $15-17.50/meal, keeps the margin")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Vendor can sell additional à la carte meals at their own prices")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Example: ", italics: true }), new TextRun("40 people × 8 meals × $5 margin = $1,600 to event")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Menu Guidelines")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Hearty breakfast (eggs, potatoes, bacon/sausage, fruit, coffee)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Dinner variety (tacos, pasta, curry rotation)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Vegetarian/vegan options mandatory")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Late night snacks available for purchase (grilled cheese, quesadillas)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Coffee/tea station available throughout the day")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Revenue Projections")] }),
      new Table({
        columnWidths: [3120, 2340, 1800, 2100],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Scenario", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Meal Plan Buyers", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Gross", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2100, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Event Margin", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Small Event (150)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("30 attendees")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$3,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2100, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$750")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Mid-Size (500)")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("100 attendees")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$10,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2100, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$2,500")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Large Event (1,500)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("300 attendees")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$30,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2100, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$7,500")] })] }),
          ]}),
        ]
      }),
      new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "Note: ", bold: true }), new TextRun("Assumes 20% uptake on meal plans and 25% margin after vendor costs.")] }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // STAGE PARTNERSHIPS
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Stage Partnerships")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun("Partner stages only become relevant at Phase 3+ (500+ attendees). At Phase 1-2, the event runs with Subphonic main stage and Keith's dome only - we don't need multiple stages if we don't have the people to fill them.")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Production by Phase")] }),
      new Table({
        columnWidths: [2340, 2340, 4680],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Phase", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Attendance", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Stage Setup", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Phase 1 (Tier 1-3)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("150-200")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Subphonic main stage + Keith's dome")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Phase 2 (Tier 4-7)")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("300-500")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Subphonic upgraded + Keith's dome")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Phase 3 (Tier 8-11)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("500-800")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Main + Dome + 1 Partner Stage")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Phase 4 (Tier 12-15)")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("1,000-1,500")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Festival-grade main + Dome + 2 Partner Stages")] })] }),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Partner Stage Structure (Phase 3+ Only)")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun("When attendance justifies additional stages, production crews can bring their own stage with full creative control.")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Partner provides: ", bold: true }), new TextRun("Sound system, lighting, artists for their stage, crew to run it")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Reeguez Rocks provides: ", bold: true }), new TextRun("Venue access, power hookup, camping for crew, promotion")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Partner promotes using trackable promo codes")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("All promotion runs through Reeguez Rocks channels")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Partner Compensation (Scales with Event)")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun("Partners are invested in the event's success - compensation grows as the event grows.")] }),
      new Table({
        columnWidths: [1800, 1560, 1560, 1560, 1560, 1320],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Phase", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Base Pay", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Per Ticket*", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Profit %", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Crew Passes", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1320, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Pass Value", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Phase 3")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$750")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$3")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("20% split")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("6")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1320, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("~$780")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Phase 4")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1,500")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$4")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("20% split")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("8")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1320, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("~$1,040")] })] }),
          ]}),
        ]
      }),
      new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "*Per ticket sold through their promo code. ", italics: true }), new TextRun({ text: "Profit % is share of event surplus, split among all partners.", italics: true })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200 }, children: [new TextRun("Example: Partner at Phase 4 sells 60 tickets")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Base pay: $1,500")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Per-ticket bonus: 60 × $4 = $240")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Profit share: ~$500-1,000 (depending on surplus)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Crew passes value: ~$1,040")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Total value: $3,280-3,780", bold: true })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Ideal Partner Criteria")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Has their own sound system capable of outdoor deployment")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Books artists that complement bass/dubstep vibe (or provide contrast genre)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Has an engaged following they can mobilize for ticket sales")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Hungry crew looking to grow beyond club shows")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Reliable - will actually show up and execute")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Outreach Template")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "\"Hey [Crew], I'm putting together Reeguez Rocks 2026 - a bass/dubstep camping festival at Camp Tahquitz in the San Bernardino Mountains, October 2026. If we hit 500+ attendees, I'm looking for crews to bring their own stage. You'd run your stage your way, get camping for your crew, base pay that scales with our size, plus bonus for every ticket you help sell. You bring the sound system and artists, I handle promotion and venue. Interested in talking?\"", italics: true })] }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // COMPENSATION MODEL
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Compensation Model")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun("Everyone who contributes gets rewarded when the event succeeds. The profit pool grows with each tier reached, so there's always an incentive to keep selling - hitting the next tier is good for everyone, not just the event.")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Profit Pool Structure")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun("The profit pool grows in two ways: (1) each tier reached adds a fixed contribution, and (2) any remaining surplus after expenses goes to the pool.")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Tier Contributions to Profit Pool")] }),
      new Table({
        columnWidths: [2340, 2340, 2340, 2340],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Phase", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Per Tier Reached", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tiers in Phase", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Phase Total", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Phase 1 (Tier 1-3)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$300")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("3")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$900")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Phase 2 (Tier 4-7)")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$500")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("4")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$2,000")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Phase 3 (Tier 8-11)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$750")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("4")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$3,000")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Phase 4 (Tier 12-15)")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("4")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$4,000")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "MAX FROM TIERS", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("")] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "15", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$9,900", bold: true, color: "FFFFFF" })] })] }),
          ]}),
        ]
      }),
      new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "Key insight: ", bold: true }), new TextRun("Hitting a tier never hurts anyone - it always adds to the pool. No more stopping sales when you're close to a threshold.")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200 }, children: [new TextRun("Example: Event Reaches Tier 11")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tier contributions: $900 + $2,000 + $3,000 = $5,900")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Remaining surplus after expenses: ~$2,000")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Total profit pool: $7,900", bold: true })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Individual Affiliate Links")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun("Everyone gets a unique trackable link to sell tickets. Each sale through their link earns a kickback - this creates a sales army where the whole community is promoting.")] }),

      new Table({
        columnWidths: [2800, 1800, 4760],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Role", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Per Ticket", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 4760, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Notes", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Stage Partners")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$3-4")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4760, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Highest rate - they're bringing production value")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Local/Opener DJs")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$2")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4760, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Playing for free but can earn through promotion")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Vendors")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$2")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4760, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Plugged into the scene, can reach their customer base")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Contracted Artists")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4760, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Optional - already paid, but can earn extra")] })] }),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200 }, children: [new TextRun("Example: Local DJ Sells 25 Tickets")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Affiliate kickback: 25 × $2 = $50 (paid regardless of tier)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Plus profit pool share based on set length")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("If they play 1 hour at Phase 3 with $7,900 pool: ~$300-400 from pool")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Total potential: $350-450 for playing \"free\"", bold: true })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Who Gets Paid What")] }),
      new Table({
        columnWidths: [2400, 2800, 2200, 1960],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2400, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Role", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Upfront Payment", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Affiliate Link", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1960, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Profit Pool", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2400, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Headliners")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Contract")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1/ticket (optional)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1960, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("No")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2400, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Support Acts")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Contract")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1/ticket (optional)")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1960, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("No")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2400, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Local/Opener DJs")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Free")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$2/ticket", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1960, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "YES", bold: true })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2400, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Vendors")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Booth fee")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$2/ticket", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1960, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("No")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2400, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Subphonic")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("$3,000-6,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("No")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1960, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("No")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2400, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Keith (Dome)")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("$900")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("No")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1960, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("No")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2400, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Stage Partners")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Base (Phase 3+)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$3-4/ticket", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1960, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "YES", bold: true })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2400, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Volunteers")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Pass + meals")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("No")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1960, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("No")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2400, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Organizers")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("$0")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("No")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1960, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "YES", bold: true })] })] }),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Profit Pool Distribution")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun("The profit pool (tier contributions + surplus) is distributed after the event:")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Phase 1-2 (No Partner Stages)")] }),
      new Table({
        columnWidths: [4680, 2340, 2340],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Recipient", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "% of Pool", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Example ($3k)", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Local/Opener Artist Pool")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("30%")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$900")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Organizers")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("50%")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1,500")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Next Year Seed Fund")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("20%")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$600")] })] }),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200 }, children: [new TextRun("Phase 3-4 (With Partner Stages)")] }),
      new Table({
        columnWidths: [4680, 2340, 2340],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Recipient", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "% of Pool", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Example ($10k)", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Stage Partners (split among all)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("20%")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$2,000")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Local/Opener Artist Pool")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("25%")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$2,500")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Organizers")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("40%")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$4,000")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Next Year Seed Fund")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("15%")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1,500")] })] }),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Local/Opener Pool Distribution")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun("Local DJs who play for free share the local pool based on set length. This is separate from their affiliate kickbacks.")] }),

      new Table({
        columnWidths: [4680, 2340, 2340],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Set Length", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Points", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Relative Share", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("1 hour")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("2")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("2x")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("45 minutes")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("1.5")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("1.5x")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("30 minutes")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("1")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("1x")] })] }),
          ]}),
        ]
      }),
      new Paragraph({ spacing: { before: 100, after: 100 }, children: [new TextRun({ text: "Formula: ", bold: true }), new TextRun("(Your Points ÷ Total Points) × Local Pool = Pool Payout")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Total earnings: ", bold: true }), new TextRun("Affiliate kickbacks + Pool share")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("The Pitch")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "To local DJs: ", bold: true }), new TextRun({ text: "\"You get a link - every ticket you sell puts $2 in your pocket immediately. Play a set and you also get a share of the profit pool. The bigger the event gets, the bigger your payout. Help us hit tiers and everyone wins.\"", italics: true })] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "To vendors: ", bold: true }), new TextRun({ text: "\"You get a link too. Send your customers our way and earn $2 per ticket. More people at the event means more customers for your booth.\"", italics: true })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "To stage partners: ", bold: true }), new TextRun({ text: "\"Base pay, $3-4 per ticket you sell, plus a cut of the profit pool. Every tier we hit adds to the pool - so keep selling even when we're close to the next level.\"", italics: true })] }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // VENDOR PROGRAM
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Vendor Program")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Fee Structure Options")] }),

      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Option A: Flat Booth Fee", bold: true, size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("$50-200 depending on booth size")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Simple and predictable")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Vendor pays fee, keeps all sales")] }),

      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Option B: Hybrid Model (Recommended)", bold: true, size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("$75 booth fee includes 1 GA ticket ($99 value)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Vendor gets a deal while event gets cash + engaged participant")] }),

      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Option C: Ticket Trade", bold: true, size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Free/discounted admission for services")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Best for food vendors who can provide staff meals at cost")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Target Vendor Categories")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Food vendors (late night munchies essential)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Coffee/tea/energy drinks")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Heady glass and accessories")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Flow arts gear (poi, hoops, fans, staffs)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Wook fashion (patchwork, tie-dye, festival wear)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Handmade jewelry and pins")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Art prints and tapestries")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Healing arts (massage, energy work)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Harm reduction / wellness booth")] }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // INSURANCE
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Insurance Requirements")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Coverage Required")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("$2,000,000 general liability policy")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Camp Tahquitz named as Additional Insured")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("No alcohol sales on site = no liquor liability needed")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Estimated cost: $800-1,500 for 6-day event")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Providers to Quote")] }),
      new Paragraph({ numbering: { reference: "numbered-1", level: 0 }, children: [new TextRun("TheEventHelper.com")] }),
      new Paragraph({ numbering: { reference: "numbered-1", level: 0 }, children: [new TextRun("SpecialEventInsurance.com")] }),
      new Paragraph({ numbering: { reference: "numbered-1", level: 0 }, children: [new TextRun("K&K Insurance")] }),
      new Paragraph({ numbering: { reference: "numbered-1", level: 0 }, children: [new TextRun("SADLER Sports & Recreation Insurance")] }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // REVENUE SCENARIOS
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Revenue Scenarios")] }),

      new Paragraph({ spacing: { after: 200 }, children: [new TextRun("Projections at different attendance levels, assuming mixed ticket types and add-on purchases:")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Small Event (150 Attendees)")] }),
      new Table({
        columnWidths: [3120, 1560, 1560, 1560, 1560],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Revenue Source", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Qty", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Rate", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Margin", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Total", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("4-Day Passes")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("100")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$99")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$59")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$5,900")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("3-Day Passes")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("30")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$80")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$50")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1,500")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("2-Day Passes")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("20")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$60")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$40")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$800")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Cabins")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("4")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$4,000")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Car Camping")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("40")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$30")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$30")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1,200")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "TOTAL MARGIN", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("")] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("")] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("")] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$13,400", bold: true, color: "FFFFFF" })] })] }),
          ]}),
        ]
      }),
      new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "Reaches: ", bold: true }), new TextRun("Phase 1 (Tier 3) - Basic production unlocked")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Mid-Size Event (500 Attendees)")] }),
      new Table({
        columnWidths: [3120, 1560, 1560, 1560, 1560],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Revenue Source", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Qty", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Rate", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Margin", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Total", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("4-Day Passes")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("350")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$99")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$59")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$20,650")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("3-Day Passes")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("100")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$80")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$50")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$5,000")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("2-Day Passes")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("50")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$60")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$40")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$2,000")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Cabins")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("6")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$6,000")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Car Camping")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("150")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$30")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$30")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$4,500")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Meal Plans (20%)")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("100")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$100")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$25")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$2,500")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "TOTAL MARGIN", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("")] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("")] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("")] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$40,650", bold: true, color: "FFFFFF" })] })] }),
          ]}),
        ]
      }),
      new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "Reaches: ", bold: true }), new TextRun("Phase 3 (Tier 10) - Second stage and art installations unlocked")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Large Event (1,500 Attendees)")] }),
      new Table({
        columnWidths: [3120, 1560, 1560, 1560, 1560],
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Revenue Source", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Qty", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Rate", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Margin", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Total", bold: true, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("4-Day Passes")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("1,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$99")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$59")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$59,000")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("3-Day Passes")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("300")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$80")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$50")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$15,000")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("2-Day Passes")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("200")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$60")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$40")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$8,000")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Cabins")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("6")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$1,000")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$6,000")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Car Camping")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("500")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$30")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$30")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$15,000")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Meal Plans (20%)")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("300")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$100")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$25")] })] }),
            new TableCell({ borders: cellBorders, shading: altRowFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$7,500")] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "TOTAL MARGIN", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("")] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("")] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("")] })] }),
            new TableCell({ borders: cellBorders, shading: headerFill, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$110,500", bold: true, color: "FFFFFF" })] })] }),
          ]}),
        ]
      }),
      new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "Reaches: ", bold: true }), new TextRun("Phase 4 (Tier 15) - Full festival experience with ~$26,000 surplus for contingency/profit")] }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // PLANNING CHECKLIST
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Planning Checklist")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Pre-Launch")] }),
      new Paragraph({ numbering: { reference: "numbered-2", level: 0 }, children: [new TextRun("Finalize October 2026 dates with Camp Tahquitz")] }),
      new Paragraph({ numbering: { reference: "numbered-2", level: 0 }, children: [new TextRun("Confirm venue agreement and payment terms")] }),
      new Paragraph({ numbering: { reference: "numbered-2", level: 0 }, children: [new TextRun("Negotiate Tribe of Tahquitz partnership for staffed activities")] }),
      new Paragraph({ numbering: { reference: "numbered-2", level: 0 }, children: [new TextRun("Get insurance quotes")] }),
      new Paragraph({ numbering: { reference: "numbered-2", level: 0 }, children: [new TextRun("Confirm Subphonic availability")] }),
      new Paragraph({ numbering: { reference: "numbered-2", level: 0 }, children: [new TextRun("Confirm dome with Keith")] }),
      new Paragraph({ numbering: { reference: "numbered-2", level: 0 }, children: [new TextRun("Set up ticketing platform with promo code tracking")] }),
      new Paragraph({ numbering: { reference: "numbered-2", level: 0 }, children: [new TextRun("Create event graphics")] }),
      new Paragraph({ numbering: { reference: "numbered-2", level: 0 }, children: [new TextRun("Launch crowdfunding campaign")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Tier 1 Reached ($3,000)")] }),
      new Paragraph({ numbering: { reference: "numbered-3", level: 0 }, children: [new TextRun("Purchase insurance")] }),
      new Paragraph({ numbering: { reference: "numbered-3", level: 0 }, children: [new TextRun("Send insurance certificate to Camp Tahquitz")] }),
      new Paragraph({ numbering: { reference: "numbered-3", level: 0 }, children: [new TextRun("Announce event confirmed")] }),
      new Paragraph({ numbering: { reference: "numbered-3", level: 0 }, children: [new TextRun("Open general ticket sales")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Tier 2 Reached ($8,000)")] }),
      new Paragraph({ numbering: { reference: "numbered-4", level: 0 }, children: [new TextRun("Begin artist outreach")] }),
      new Paragraph({ numbering: { reference: "numbered-4", level: 0 }, children: [new TextRun("Book headliner")] }),
      new Paragraph({ numbering: { reference: "numbered-4", level: 0 }, children: [new TextRun("Announce headliner on flyer")] }),
      new Paragraph({ numbering: { reference: "numbered-4", level: 0 }, children: [new TextRun("Begin stage partner outreach")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Pre-Event (2 Weeks)")] }),
      new Paragraph({ numbering: { reference: "numbered-5", level: 0 }, children: [new TextRun("Finalize set times")] }),
      new Paragraph({ numbering: { reference: "numbered-5", level: 0 }, children: [new TextRun("Assign cabins")] }),
      new Paragraph({ numbering: { reference: "numbered-5", level: 0 }, children: [new TextRun("Confirm vendors")] }),
      new Paragraph({ numbering: { reference: "numbered-5", level: 0 }, children: [new TextRun("Confirm Tribe activity staff schedule")] }),
      new Paragraph({ numbering: { reference: "numbered-5", level: 0 }, children: [new TextRun("Recruit volunteers (gate, cleanup)")] }),
      new Paragraph({ numbering: { reference: "numbered-5", level: 0 }, children: [new TextRun("Send attendee info (directions, October weather prep, bear safety)")] }),
      new Paragraph({ numbering: { reference: "numbered-5", level: 0 }, children: [new TextRun("Reserve U-Hauls")] }),
      new Paragraph({ numbering: { reference: "numbered-5", level: 0 }, children: [new TextRun("Confirm catering partner meal counts")] }),

      // FINAL PAGE
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Document Information")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Created: ", bold: true }), new TextRun("November 2025")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Event: ", bold: true }), new TextRun("Reeguez Rocks 2026")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Location: ", bold: true }), new TextRun("Camp Tahquitz, Angelus Oaks, CA")] }),
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Date: ", bold: true }), new TextRun("October 2026")] }),
      new Paragraph({ spacing: { after: 400 }, children: [new TextRun({ text: "Status: ", bold: true }), new TextRun("Planning Phase")] }),

      new Paragraph({ spacing: { after: 200 }, children: [new TextRun("This document contains the complete planning framework for Reeguez Rocks 2026, including venue details, pricing structures, crowdfunding tiers, partnership models, and operational checklists. Options are presented where decisions remain open.")] }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("reeguez_rocks_2026_plan.docx", buffer);
  console.log("Document created successfully");
});
