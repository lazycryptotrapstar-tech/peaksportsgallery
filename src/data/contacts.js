// ============================================================
// SIMPLE GENIUS — DEMO CONTACT ROSTER
// All 12 Peak Sports portfolio schools
// Each school has ticket buyers + sponsors
// Replace with real Vivenue/CRM data per school on activation
// ============================================================

export const SCHOOL_CONTACTS = {

  // ── WOFFORD ────────────────────────────────────────────────
  wofford: {
    TICKETS: [
      { id:1,  name:'Scott Kull',          email:'kullsr@wofford.edu',                 title:'Director of Athletics',        purchase_count:8, last_purchase_date:'2024-11-15', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:82 },
      { id:2,  name:'Nayef Samhat',        email:'samhatnr@wofford.edu',               title:'President',                    purchase_count:4, last_purchase_date:'2024-10-20', last_purchase_sport:'football',   last_purchase_type:'premium', last_game_type:'rivalry', is_lapsed_season:false, is_alumni:false, status:'warm', score:74 },
      { id:3,  name:'Shawn Watson',        email:'watsonsc@wofford.edu',               title:'Head Football Coach',          purchase_count:6, last_purchase_date:'2025-01-10', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'hot',  score:91 },
      { id:4,  name:'Kevin Giltner',       email:'giltnerkj@wofford.edu',              title:'Head Basketball Coach',        purchase_count:5, last_purchase_date:'2025-02-14', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'hot',  score:88 },
      { id:5,  name:'Calhoun Kennedy Jr.', email:'kennedycl@wofford.edu',              title:'VP Philanthropy & Engagement', purchase_count:2, last_purchase_date:'2024-09-01', last_purchase_sport:'football',   last_purchase_type:'single',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'hot',  score:79 },
    ],
    SPONSORSHIP: [
      { id:6,  name:'Hub City Tap House',   email:'manager@hubcitytap.com',            title:'Owner',              business_type:'restaurant', sponsor_status:'prospect', status:'hot',  score:85 },
      { id:7,  name:'Spartanburg Regional', email:'marketing@spartanburgregional.com', title:'Marketing Director', business_type:'healthcare', sponsor_status:'current',  renewal_date:'2026-06-01', annual_value:8000, status:'warm', score:77 },
      { id:8,  name:'R.J. Rockers Brewing', email:'info@rjrockers.com',                title:'Owner',              business_type:'restaurant', sponsor_status:'lapsed',   status:'warm', score:68 },
      { id:9,  name:'Beacon Drive-In',      email:'hello@beacondrivein.com',           title:'Manager',            business_type:'restaurant', sponsor_status:'prospect', status:'cold', score:44 },
    ],
  },

  // ── EASTERN KENTUCKY ───────────────────────────────────────
  eku: {
    TICKETS: [
      { id:101, name:'Mark Sandy',         email:'msandy@eku.edu',           title:'Director of Athletics',   purchase_count:7, last_purchase_date:'2024-11-02', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:80 },
      { id:102, name:'Walt Wells',         email:'walt.wells@ekusports.com', title:'Head Football Coach',     purchase_count:5, last_purchase_date:'2025-01-18', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:false, is_alumni:false, status:'hot',  score:88 },
      { id:103, name:'Paul Rhodes',        email:'paul.rhodes@eku.edu',      title:'Head Basketball Coach',   purchase_count:4, last_purchase_date:'2025-02-08', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'hot',  score:83 },
      { id:104, name:'David McFaddin',     email:'dmcfaddin@eku.edu',        title:'VP Student Affairs',      purchase_count:3, last_purchase_date:'2024-09-14', last_purchase_sport:'football',   last_purchase_type:'single',  last_game_type:'rivalry', is_lapsed_season:false, is_alumni:true,  status:'warm', score:71 },
      { id:105, name:'James Ratliff',      email:'jratliff@eku.edu',         title:'Alumni Board Chair',      purchase_count:9, last_purchase_date:'2023-11-05', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:true,  is_alumni:true,  status:'hot',  score:92 },
    ],
    SPONSORSHIP: [
      { id:106, name:"Mango's Restaurant",      email:'owner@mangosrichmond.com',      title:'Owner',              business_type:'restaurant',           sponsor_status:'prospect', status:'hot',  score:82 },
      { id:107, name:'Madison Garden',           email:'events@madisongardenky.com',    title:'Events Manager',     business_type:'entertainment',        sponsor_status:'lapsed',   status:'warm', score:70 },
      { id:108, name:'Eastern Kentucky Power',   email:'marketing@ekpower.com',         title:'Marketing Director', business_type:'regional_brand',       sponsor_status:'current',  renewal_date:'2026-05-01', annual_value:12000, status:'warm', score:75 },
      { id:109, name:'First Federal Savings',    email:'community@firstfederalky.com',  title:'Community Relations',business_type:'professional_services', sponsor_status:'prospect', status:'cold', score:48 },
    ],
  },

  // ── BALL STATE ─────────────────────────────────────────────
  ballstate: {
    TICKETS: [
      { id:201, name:'Beth Goetz',         email:'bgoetz@bsu.edu',           title:'Director of Athletics',   purchase_count:6, last_purchase_date:'2024-10-26', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:78 },
      { id:202, name:'Mike Neu',           email:'mneu@bsu.edu',             title:'Head Football Coach',     purchase_count:5, last_purchase_date:'2025-01-05', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:false, is_alumni:false, status:'hot',  score:85 },
      { id:203, name:'Michael Lewis',      email:'mlewis@bsu.edu',           title:'Head Basketball Coach',   purchase_count:4, last_purchase_date:'2025-02-20', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'hot',  score:82 },
      { id:204, name:'Roger Smitter',      email:'rsmitter@bsu.edu',         title:'University President',    purchase_count:3, last_purchase_date:'2024-08-30', last_purchase_sport:'football',   last_purchase_type:'premium', last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:72 },
      { id:205, name:'Thomas Anderson',    email:'tanderson@alumni.bsu.edu', title:'Alumni Association President', purchase_count:8, last_purchase_date:'2023-10-14', last_purchase_sport:'football', last_purchase_type:'season', last_game_type:'rivalry', is_lapsed_season:true, is_alumni:true, status:'hot', score:90 },
    ],
    SPONSORSHIP: [
      { id:206, name:'Elm Street Brewing',     email:'hello@elmstreetbrewing.com',    title:'Owner',              business_type:'restaurant',     sponsor_status:'prospect', status:'hot',  score:80 },
      { id:207, name:'Muncie Power Products',  email:'marketing@munciepower.com',     title:'Marketing Manager',  business_type:'regional_brand', sponsor_status:'current',  renewal_date:'2026-07-01', annual_value:15000, status:'warm', score:76 },
      { id:208, name:'IU Health Ball Memorial',email:'community@iuhealth.org',        title:'Community Director', business_type:'healthcare',     sponsor_status:'current',  renewal_date:'2026-04-15', annual_value:22000, status:'hot',  score:88 },
      { id:209, name:'The Heorot',             email:'info@theheorot.com',            title:'Owner',              business_type:'restaurant',     sponsor_status:'lapsed',   status:'cold', score:42 },
    ],
  },

  // ── AKRON ──────────────────────────────────────────────────
  akron: {
    TICKETS: [
      { id:301, name:'Charles Guthrie',    email:'cguthrie@uakron.edu',      title:'Director of Athletics',   purchase_count:5, last_purchase_date:'2024-11-09', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:76 },
      { id:302, name:'Joe Moorhead',       email:'jmoorhead@uakron.edu',     title:'Head Football Coach',     purchase_count:4, last_purchase_date:'2025-01-22', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:false, is_alumni:false, status:'hot',  score:84 },
      { id:303, name:'John Groce',         email:'jgroce@uakron.edu',        title:'Head Basketball Coach',   purchase_count:6, last_purchase_date:'2025-02-01', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'hot',  score:87 },
      { id:304, name:'Gary Miller',        email:'gmiller@uakron.edu',       title:'University President',    purchase_count:3, last_purchase_date:'2024-09-28', last_purchase_sport:'football',   last_purchase_type:'premium', last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:69 },
      { id:305, name:'Patricia Higgins',   email:'phiggins@alumni.uakron.edu','title':'Alumni Foundation Chair', purchase_count:7, last_purchase_date:'2023-10-21', last_purchase_sport:'football', last_purchase_type:'season', last_game_type:'rivalry', is_lapsed_season:true, is_alumni:true, status:'hot', score:91 },
    ],
    SPONSORSHIP: [
      { id:306, name:'Goodyear Tire',          email:'sponsorships@goodyear.com',     title:'Sponsorship Manager', business_type:'regional_brand',       sponsor_status:'current',  renewal_date:'2026-08-01', annual_value:45000, status:'hot',  score:92 },
      { id:307, name:"Swenson's Drive-In",     email:'owner@swensons.com',            title:'Owner',               business_type:'restaurant',           sponsor_status:'prospect', status:'hot',  score:79 },
      { id:308, name:"Akron Children's Hospital", email:'marketing@akronchildrens.org', title:'Marketing Director', business_type:'healthcare',          sponsor_status:'lapsed',   status:'warm', score:65 },
      { id:309, name:'FirstEnergy',            email:'community@firstenergy.com',     title:'Community Affairs',   business_type:'regional_brand',       sponsor_status:'current',  renewal_date:'2026-03-01', annual_value:18000, status:'warm', score:74 },
    ],
  },

  // ── WEST GEORGIA ───────────────────────────────────────────
  westgeorgia: {
    TICKETS: [
      { id:401, name:'Alex Whicker',       email:'awhicker@westga.edu',      title:'Director of Athletics',   purchase_count:5, last_purchase_date:'2024-10-19', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:74 },
      { id:402, name:'Will Hall',          email:'whall@westga.edu',         title:'Head Football Coach',     purchase_count:4, last_purchase_date:'2025-01-11', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:false, is_alumni:false, status:'hot',  score:83 },
      { id:403, name:'Michael Craft',      email:'mcraft@westga.edu',        title:'Head Basketball Coach',   purchase_count:3, last_purchase_date:'2025-02-16', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'hot',  score:79 },
      { id:404, name:'Brendan Kelly',      email:'bkelly@westga.edu',        title:'University President',    purchase_count:2, last_purchase_date:'2024-08-24', last_purchase_sport:'football',   last_purchase_type:'single',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'warm', score:66 },
      { id:405, name:'Sandra Morrison',    email:'smorrison@alumni.westga.edu','title':'Alumni Board Chair',  purchase_count:6, last_purchase_date:'2023-11-02', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:true,  is_alumni:true,  status:'hot',  score:87 },
    ],
    SPONSORSHIP: [
      { id:406, name:'Southwire',              email:'community@southwire.com',       title:'Community Relations', business_type:'regional_brand',       sponsor_status:'current',  renewal_date:'2026-09-01', annual_value:20000, status:'hot',  score:88 },
      { id:407, name:'TrueCore Federal Credit',email:'marketing@truecorecu.com',      title:'Marketing Director',  business_type:'professional_services', sponsor_status:'prospect', status:'warm', score:72 },
      { id:408, name:'Fork in the Road',       email:'owner@forkintheroadga.com',     title:'Owner',               business_type:'restaurant',           sponsor_status:'lapsed',   status:'warm', score:63 },
      { id:409, name:'Georgia Primary Bank',   email:'business@georgiaprimarybank.com','title':'Business Dev',     business_type:'professional_services', sponsor_status:'prospect', status:'cold', score:45 },
    ],
  },

  // ── SE LOUISIANA ───────────────────────────────────────────
  selouisiana: {
    TICKETS: [
      { id:501, name:'Jay Artigues',       email:'jartigues@southeastern.edu', title:'Director of Athletics', purchase_count:6, last_purchase_date:'2024-10-12', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:77 },
      { id:502, name:'Frank Scelfo',       email:'fscelfo@southeastern.edu',   title:'Head Football Coach',   purchase_count:5, last_purchase_date:'2025-01-08', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:false, is_alumni:false, status:'hot',  score:85 },
      { id:503, name:'David Kiefer',       email:'dkiefer@southeastern.edu',   title:'Head Basketball Coach', purchase_count:3, last_purchase_date:'2025-02-10', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'hot',  score:80 },
      { id:504, name:'John Crain',         email:'jcrain@southeastern.edu',    title:'University President',  purchase_count:2, last_purchase_date:'2024-09-06', last_purchase_sport:'football',   last_purchase_type:'premium', last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:68 },
      { id:505, name:'Marie Thibodaux',    email:'mthibodaux@alumni.selu.edu', title:'Alumni Foundation Chair',purchase_count:8, last_purchase_date:'2023-10-07', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:true,  is_alumni:true,  status:'hot',  score:93 },
    ],
    SPONSORSHIP: [
      { id:506, name:'Hammond Brewing Co.',    email:'hello@hammondbrewing.com',      title:'Owner',               business_type:'restaurant',           sponsor_status:'prospect', status:'hot',  score:81 },
      { id:507, name:"Raising Cane's",         email:'sponsorships@raisingcanes.com', title:'Regional Sponsorship', business_type:'restaurant',          sponsor_status:'current',  renewal_date:'2026-06-01', annual_value:10000, status:'warm', score:74 },
      { id:508, name:'Ochsner Health',         email:'community@ochsner.org',         title:'Community Affairs',   business_type:'healthcare',           sponsor_status:'lapsed',   status:'warm', score:67 },
      { id:509, name:'Smoothie King',          email:'sponsorships@smoothieking.com', title:'Regional Marketing',  business_type:'restaurant',           sponsor_status:'prospect', status:'cold', score:40 },
    ],
  },

  // ── LINDENWOOD ─────────────────────────────────────────────
  lindenwood: {
    TICKETS: [
      { id:601, name:'Rick Mello',         email:'rmello@lindenwood.edu',    title:'Director of Athletics',   purchase_count:5, last_purchase_date:'2024-10-25', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:75 },
      { id:602, name:'Tom Matukewicz',     email:'tmatukewicz@lindenwood.edu','title':'Head Football Coach',  purchase_count:4, last_purchase_date:'2025-01-15', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:false, is_alumni:false, status:'hot',  score:82 },
      { id:603, name:'Kyle Gerdemann',     email:'kgerdemann@lindenwood.edu', title:'Head Basketball Coach',  purchase_count:3, last_purchase_date:'2025-02-18', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'hot',  score:78 },
      { id:604, name:'John Porter',        email:'jporter@lindenwood.edu',   title:'University President',   purchase_count:2, last_purchase_date:'2024-08-15', last_purchase_sport:'football',   last_purchase_type:'single',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'warm', score:64 },
      { id:605, name:'Carol Kimbrough',    email:'ckimbrough@alumni.lu.edu', title:'Alumni Association Chair',purchase_count:7, last_purchase_date:'2023-10-28', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:true,  is_alumni:true,  status:'hot',  score:89 },
    ],
    SPONSORSHIP: [
      { id:606, name:'World Wide Technology',  email:'sponsorships@wwt.com',          title:'Sponsorship Manager', business_type:'regional_brand',       sponsor_status:'current',  renewal_date:'2026-10-01', annual_value:25000, status:'hot',  score:90 },
      { id:607, name:'St. Charles Toyota',     email:'marketing@stcharlestoyota.com', title:'Marketing Director',  business_type:'retail',               sponsor_status:'prospect', status:'hot',  score:78 },
      { id:608, name:'Lewis Rice LLC',         email:'business@lewisrice.com',        title:'Managing Partner',    business_type:'professional_services', sponsor_status:'lapsed',   status:'warm', score:65 },
      { id:609, name:'Parkway School District',email:'community@parkwayschools.net',  title:'Community Relations', business_type:'regional_brand',       sponsor_status:'prospect', status:'cold', score:38 },
    ],
  },

  // ── EASTERN ILLINOIS ───────────────────────────────────────
  easternillinois: {
    TICKETS: [
      { id:701, name:'Tom Michael',        email:'tmichael@eiu.edu',         title:'Director of Athletics',   purchase_count:5, last_purchase_date:'2024-11-01', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:73 },
      { id:702, name:'Chris Wilkerson',    email:'cwilkerson@eiu.edu',       title:'Head Football Coach',     purchase_count:4, last_purchase_date:'2025-01-19', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:false, is_alumni:false, status:'hot',  score:81 },
      { id:703, name:'Marty Simmons',      email:'msimmons@eiu.edu',         title:'Head Basketball Coach',   purchase_count:3, last_purchase_date:'2025-02-12', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'hot',  score:77 },
      { id:704, name:'David Glassman',     email:'dglassman@eiu.edu',        title:'University President',    purchase_count:2, last_purchase_date:'2024-09-20', last_purchase_sport:'football',   last_purchase_type:'single',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'warm', score:62 },
      { id:705, name:'Bob Paddock',        email:'bpaddock@alumni.eiu.edu',  title:'Alumni Foundation Chair', purchase_count:6, last_purchase_date:'2023-10-15', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:true,  is_alumni:true,  status:'hot',  score:86 },
    ],
    SPONSORSHIP: [
      { id:706, name:'First Mid Bank',         email:'business@firstmid.com',         title:'Business Development',business_type:'professional_services', sponsor_status:'current',  renewal_date:'2026-05-01', annual_value:8000, status:'warm', score:73 },
      { id:707, name:'Sarah Bush Lincoln Health',email:'marketing@sarahbush.org',     title:'Marketing Director',  business_type:'healthcare',           sponsor_status:'prospect', status:'hot',  score:80 },
      { id:708, name:'Checkered Flag Sports Bar',email:'owner@checkeredflagbar.com',  title:'Owner',               business_type:'restaurant',           sponsor_status:'lapsed',   status:'warm', score:60 },
      { id:709, name:'Mattoon Walmart',         email:'community@walmart.com',        title:'Community Manager',   business_type:'retail',               sponsor_status:'prospect', status:'cold', score:35 },
    ],
  },

  // ── CENTRAL ARKANSAS ───────────────────────────────────────
  centralarkansas: {
    TICKETS: [
      { id:801, name:'Brad Sims',          email:'bsims@uca.edu',            title:'Director of Athletics',   purchase_count:5, last_purchase_date:'2024-10-18', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:76 },
      { id:802, name:'Nathan Brown',       email:'nbrown@uca.edu',           title:'Head Football Coach',     purchase_count:4, last_purchase_date:'2025-01-24', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:false, is_alumni:false, status:'hot',  score:84 },
      { id:803, name:'Anthony Boone',      email:'aboone@uca.edu',           title:'Head Basketball Coach',   purchase_count:3, last_purchase_date:'2025-02-06', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'hot',  score:79 },
      { id:804, name:'Houston Davis',      email:'hdavis@uca.edu',           title:'University President',    purchase_count:2, last_purchase_date:'2024-09-12', last_purchase_sport:'football',   last_purchase_type:'premium', last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:67 },
      { id:805, name:'Donna Turnbow',      email:'dturnbow@alumni.uca.edu',  title:'Alumni Foundation Chair', purchase_count:7, last_purchase_date:'2023-10-22', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:true,  is_alumni:true,  status:'hot',  score:91 },
    ],
    SPONSORSHIP: [
      { id:806, name:'Acxiom',                 email:'sponsorships@acxiom.com',       title:'Sponsorship Manager', business_type:'regional_brand',       sponsor_status:'current',  renewal_date:'2026-07-01', annual_value:18000, status:'hot',  score:87 },
      { id:807, name:'Conway Regional Health',  email:'marketing@conwayregional.com',  title:'Marketing Director',  business_type:'healthcare',           sponsor_status:'prospect', status:'hot',  score:82 },
      { id:808, name:'Bear State Financial',    email:'community@bearstatefinancial.com','title':'Community Relations',business_type:'professional_services',sponsor_status:'lapsed',  status:'warm', score:64 },
      { id:809, name:'Snap-on Tools',           email:'regional@snapon.com',           title:'Regional Manager',    business_type:'regional_brand',       sponsor_status:'prospect', status:'cold', score:42 },
    ],
  },

  // ── NORTHERN COLORADO ──────────────────────────────────────
  northerncolorado: {
    TICKETS: [
      { id:901, name:'Darren Dunn',        email:'ddunn@unco.edu',           title:'Director of Athletics',   purchase_count:4, last_purchase_date:'2024-10-05', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:72 },
      { id:902, name:'Ed McCaffrey',       email:'emccaffrey@unco.edu',      title:'Head Football Coach',     purchase_count:5, last_purchase_date:'2025-01-03', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:false, is_alumni:false, status:'hot',  score:86 },
      { id:903, name:'Jeff Linder',        email:'jlinder@unco.edu',         title:'Head Basketball Coach',   purchase_count:3, last_purchase_date:'2025-02-22', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'hot',  score:80 },
      { id:904, name:'Andy Feinstein',     email:'afeinstein@unco.edu',      title:'University President',    purchase_count:2, last_purchase_date:'2024-08-30', last_purchase_sport:'football',   last_purchase_type:'single',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'warm', score:63 },
      { id:905, name:'Kathy Brock',        email:'kbrock@alumni.unco.edu',   title:'Alumni Foundation Chair', purchase_count:6, last_purchase_date:'2023-11-10', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:true,  is_alumni:true,  status:'hot',  score:88 },
    ],
    SPONSORSHIP: [
      { id:906, name:'Banner Health',          email:'community@bannerhealth.com',    title:'Community Director',  business_type:'healthcare',           sponsor_status:'current',  renewal_date:'2026-08-01', annual_value:14000, status:'hot',  score:85 },
      { id:907, name:'Scheels Sports',         email:'marketing@scheels.com',         title:'Regional Marketing',  business_type:'retail',               sponsor_status:'prospect', status:'hot',  score:78 },
      { id:908, name:'Aims Community College', email:'president@aims.edu',            title:'President',           business_type:'regional_brand',       sponsor_status:'lapsed',   status:'warm', score:62 },
      { id:909, name:'Greeley Stampede',       email:'sponsorships@greeleystampede.com','title':'Sponsorship Director',business_type:'entertainment',    sponsor_status:'prospect', status:'cold', score:47 },
    ],
  },

  // ── SOUTHERN UTAH ──────────────────────────────────────────
  southernutah: {
    TICKETS: [
      { id:1001, name:'Mindy Benson',      email:'mbenson@suu.edu',          title:'Director of Athletics',   purchase_count:5, last_purchase_date:'2024-10-08', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:74 },
      { id:1002, name:'Demario Warren',    email:'dwarren@suu.edu',          title:'Head Football Coach',     purchase_count:4, last_purchase_date:'2025-01-14', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:false, is_alumni:false, status:'hot',  score:83 },
      { id:1003, name:'Todd Simon',        email:'tsimon@suu.edu',           title:'Head Basketball Coach',   purchase_count:3, last_purchase_date:'2025-02-04', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'hot',  score:78 },
      { id:1004, name:'Scott Wyatt',       email:'swyatt@suu.edu',           title:'University President',    purchase_count:2, last_purchase_date:'2024-09-16', last_purchase_sport:'football',   last_purchase_type:'premium', last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:66 },
      { id:1005, name:'Gary Keele',        email:'gkeele@alumni.suu.edu',    title:'Alumni Foundation Chair', purchase_count:7, last_purchase_date:'2023-10-19', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:true,  is_alumni:true,  status:'hot',  score:90 },
    ],
    SPONSORSHIP: [
      { id:1006, name:'Zions Bank',            email:'community@zionsbank.com',       title:'Community Relations', business_type:'professional_services', sponsor_status:'current',  renewal_date:'2026-06-01', annual_value:12000, status:'hot',  score:83 },
      { id:1007, name:'Cedar City Ford',       email:'marketing@cedarcityford.com',   title:'Marketing Manager',   business_type:'retail',               sponsor_status:'prospect', status:'hot',  score:76 },
      { id:1008, name:'Utah Shakespeare Festival',email:'sponsorships@bard.org',     title:'Development Director',business_type:'entertainment',        sponsor_status:'lapsed',   status:'warm', score:61 },
      { id:1009, name:'IHC Health',            email:'community@ihchealth.org',       title:'Community Affairs',   business_type:'healthcare',           sponsor_status:'prospect', status:'cold', score:44 },
    ],
  },

  // ── UTAH TECH ──────────────────────────────────────────────
  utahtech: {
    TICKETS: [
      { id:1101, name:'Jared Tanner',      email:'jtanner@utahtech.edu',     title:'Director of Athletics',   purchase_count:4, last_purchase_date:'2024-10-15', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:true,  status:'warm', score:71 },
      { id:1102, name:'Trevino Thomas',    email:'tthomas@utahtech.edu',     title:'Head Football Coach',     purchase_count:4, last_purchase_date:'2025-01-20', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'rivalry', is_lapsed_season:false, is_alumni:false, status:'hot',  score:81 },
      { id:1103, name:'Chris Dial',        email:'cdial@utahtech.edu',       title:'Head Basketball Coach',   purchase_count:3, last_purchase_date:'2025-02-17', last_purchase_sport:'basketball', last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'hot',  score:76 },
      { id:1104, name:'Richard Williams',  email:'rwilliams@utahtech.edu',   title:'University President',    purchase_count:2, last_purchase_date:'2024-08-20', last_purchase_sport:'football',   last_purchase_type:'single',  last_game_type:'regular', is_lapsed_season:false, is_alumni:false, status:'warm', score:60 },
      { id:1105, name:'Lisa Walton',       email:'lwalton@alumni.utahtech.edu','title':'Alumni Board Chair',  purchase_count:5, last_purchase_date:'2023-11-08', last_purchase_sport:'football',   last_purchase_type:'season',  last_game_type:'regular', is_lapsed_season:true,  is_alumni:true,  status:'hot',  score:85 },
    ],
    SPONSORSHIP: [
      { id:1106, name:'Sunroc Corporation',    email:'marketing@sunroc.com',          title:'Marketing Director',  business_type:'regional_brand',       sponsor_status:'current',  renewal_date:'2026-09-01', annual_value:10000, status:'hot',  score:80 },
      { id:1107, name:'Dixie Regional Medical',email:'community@dixieregional.org',   title:'Community Relations', business_type:'healthcare',           sponsor_status:'prospect', status:'hot',  score:77 },
      { id:1108, name:'Red Cliffs Mall',       email:'marketing@redcliffsmall.com',   title:'Marketing Manager',   business_type:'retail',               sponsor_status:'lapsed',   status:'warm', score:59 },
      { id:1109, name:'Washington County SD',  email:'community@wcsdut.org',          title:'Community Relations', business_type:'regional_brand',       sponsor_status:'prospect', status:'cold', score:36 },
    ],
  },

}

// Helper — get contacts for active school, fallback to empty
export const getContacts = (schoolId, campaign) => {
  const school = SCHOOL_CONTACTS[schoolId]
  if (!school) return []
  return school[campaign] || []
}

export default SCHOOL_CONTACTS
