import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SECTIONS = [
  { n: 1, title: "Parties and definitions" },
  { n: 2, title: "Contract and information before purchase" },
  { n: 3, title: "Purchaser eligibility and guest responsibility" },
  { n: 4, title: "Ticket prices taxes and fees" },
  { n: 5, title: "Payments reservations and instalments" },
  { n: 6, title: "Authorised sales fraud and purchase limits" },
  { n: 7, title: "Delivery QR codes and ticket security" },
  { n: 8, title: "Transfers resale and promotions" },
  { n: 9, title: "Arrival opening times and no reentry" },
  { n: 10, title: "Management right of admission and removal" },
  { n: 11, title: "Identity security searches and screening" },
  { n: 12, title: "Prohibited items and controlled exceptions" },
  { n: 13, title: "Private security personnel and firearms" },
  { n: 14, title: "Behaviour prohibited conduct and safeguarding" },
  { n: 15, title: "Seats zones and capacity" },
  { n: 16, title: "Children young guests and accompanying adults" },
  { n: 17, title: "Accessibility assistance and medical needs" },
  { n: 18, title: "Sound lighting weather and health information" },
  { n: 19, title: "Smoking alcohol food and beverages" },
  { n: 20, title: "Personal photography recording and social media" },
  { n: 21, title: "Official photography broadcasting and image use" },
  { n: 22, title: "CCTV personal information and marketing" },
  { n: 23, title: "Media accreditation brands and commercial activity" },
  { n: 24, title: "Skyboxes hospitality and guest lists" },
  { n: 25, title: "Skybox use service changes and damage" },
  { n: 26, title: "Transport parking and skybox shuttles" },
  { n: 27, title: "Programme teams performers and material changes" },
  { n: 28, title: "Cancellation postponement and interruption" },
  { n: 29, title: "Refund requests exchanges and customer cancellation" },
  { n: 30, title: "Event risk liability and remedies" },
  { n: 31, title: "Emergency directions evacuation and lost property" },
  { n: 32, title: "Website use availability and communications" },
  { n: 33, title: "Complaints governing law and dispute resolution" },
  { n: 34, title: "Updates contacts and acceptance" },
];

const CONTENT = [
  {
    n: 1,
    paras: [
      "1.1 The event is owned by the Ministry of Sports and organised by Talanta Sports City. Talanta Sports City is responsible for event organisation, ticketing and guest support. References to “we”, “us” and “management” mean Talanta Sports City and its authorised event management representatives, acting within their respective responsibilities. The Ministry of Sports retains its role as event owner.",
      "1.2 The official ticketing website is www.talantasportscity.com. Talanta Sports City sells tickets through this website and any additional outlets expressly authorised on it. For ticketing, booking, refund, complaints and other customer enquiries, contact ticketing@talantasportscity.com. Payment processors and other service providers perform their stated functions and are not, solely by processing a payment, the event owner or organiser.",
      "1.3 “Event” means the match, opening ceremony, concert or other programme identified in your order. “Venue” means Talanta Sports City and designated controlled areas, including any event-managed shuttle assembly point. “Ticket” includes an electronic pass, QR code, approved paper ticket or linked wristband. “Purchaser” is the person placing the order; “guest” means any person using a ticket. “Hospitality” includes a skybox or other premium package expressly purchased.",
    ],
  },
  {
    n: 2,
    paras: [
      "2.1 The event listing and checkout identify the event date, venue, ticket category, seat or allocation method, admission conditions, total price, taxes, fees, included services, relevant age limits, accessibility arrangements and refund policy. An advertised benefit is included where it forms part of the package description or a binding representation made to you.",
      "2.2 Before submitting your order, review the details, correct any errors and accept or decline these terms. Your contract is formed when Talanta Sports City confirms acceptance of your order and payment or an expressly agreed payment plan. A pending payment notification, unconfirmed reservation or screenshot of an attempted payment does not itself confirm a booking.",
      "2.3 We will provide a copy of your accepted terms and order details with your confirmation in a form you can retain. Applicable consumer law and any clearer or more favourable express promise made to you prevail over a conflicting general clause. A signed hospitality agreement may supplement these terms but cannot remove your non-excludable rights. Safety instructions govern attendance and do not change the price or essential services you purchased.",
    ],
  },
  {
    n: 3,
    paras: [
      "3.1 The purchaser must be at least 18 years old and authorised to use the payment method. A company purchaser must have authority to bind the company. Accurate contact and delivery details must be supplied; tell the seller promptly if they change.",
      "3.2 When purchasing for others, give each guest the ticket, entry rules, privacy notice and relevant package information before attendance. You may not give optional photography or marketing consent for another adult without their authority. Each adult remains responsible for their own conduct.",
      "3.3 The purchaser is responsible for deliberate misuse of the booking that they authorise or cause. A corporate host must cooperate with guest-list and capacity controls but is not automatically liable for every independent act of every guest. Responsibility for loss or damage will be assessed by reference to fault, evidence and applicable law.",
    ],
  },
  {
    n: 4,
    paras: [
      "4.1 All prices are in Kenya shillings unless expressly stated otherwise. The total payable, VAT treatment, booking fees, processing charges and any optional service charges are displayed before payment. No compulsory fee will be introduced only after you commit to buy.",
      "4.2 A ticket price relates to the specified event and category. Travel, accommodation, merchandise, premium beverages, parking, tours and other services are excluded unless expressly listed. Optional purchases must be selected by you and must not be added through preselected consent.",
      "4.3 If we discover a genuine pricing or inventory error affecting your order, we will explain the error and offer you the choice of accepting the corrected offer or cancelling the affected booking. If you cancel for that reason, we will refund the affected payment, including any processing fee charged on it. We will not debit an additional amount without your agreement. Price changes for future sales do not increase the price of an already confirmed booking.",
      "4.4 Processing fees are separately identified charges for processing a completed booking and are disclosed before payment. Once that service has been supplied, these fees are non-refundable, including following cancellation, postponement or an eligible ticket refund, unless applicable law requires repayment or we expressly agree otherwise. We will refund a processing fee charged in error or on a booking we cancel because of our own pricing or inventory error. We will not retain a fee for a processing service that was not supplied. These terms do not restrict your statutory refund or payment-dispute rights.",
    ],
  },
  {
    n: 5,
    paras: [
      "5.1 Pay only through the official payment channels displayed on www.talantasportscity.com or expressly authorised by Talanta Sports City. Never send money to a personal number or account merely because it is described as belonging to a staff member. Check the merchant name and order reference before confirming payment.",
      "5.2 A temporary seat hold expires at the time shown. It is not a confirmed ticket unless the stated acceptance conditions are met. If we offer an instalment arrangement, we will give you the deposit amount, payment dates, balance, release conditions and cancellation consequences in writing before you pay.",
      "5.3 If a payment is overdue, we will give a reasonable written opportunity to resolve it before cancelling, subject to applicable law and the proximity of the event. Deposits are not automatically forfeited. Any amount retained must have a lawful, disclosed basis and must take account of services supplied and recoveries from resale.",
      "5.4 If payment is debited but the booking is not confirmed, contact support with the transaction reference before paying again. Duplicate or excess payments will be investigated and returned where verified. You retain lawful payment-dispute and chargeback rights; no double recovery is permitted for the same loss.",
    ],
  },
  {
    n: 6,
    paras: [
      "6.1 Buy tickets through www.talantasportscity.com or outlets expressly authorised on that website. Unauthorised sellers may supply invalid, duplicated or misdescribed tickets. We will assist in checking validity but cannot guarantee a ticket acquired from an unauthorised source.",
      "6.2 You must not use bots, stolen payment details, false identities, unauthorised access or methods designed to defeat published purchase limits. Purchase limits and any restrictions on bulk buying will be disclosed before checkout. We may suspend a suspect order while conducting a proportionate investigation.",
      "6.3 Where fraud or misuse is substantiated, affected tickets may be cancelled and the matter referred to the relevant authorities. Where practicable and safe, we will notify the purchaser of the reason and provide a route to challenge an error. Money is not automatically confiscated solely because an order was flagged.",
    ],
  },
  {
    n: 7,
    paras: [
      "7.1 Tickets will be delivered by the method and within the timing stated at checkout. Check the confirmation, seat, category and guest details promptly. If delivery fails, contact support in sufficient time for verification and assistance.",
      "7.2 Keep QR codes, barcodes and account credentials private. Do not post them online or send them to unverified parties. A valid code is ordinarily admitted once; a subsequent scan may be refused pending verification. Where duplication is caused by our systems, we will investigate and provide an appropriate remedy.",
      "7.3 Replacement may require reasonable evidence of purchase and identity. If a replacement is issued, the earlier ticket may be disabled. There is no automatic entitlement to a second admission because a ticket has been lost, shared or copied, but support will assess legitimate cases without demanding unnecessary personal data.",
      "7.4 Follow the display instructions on your ticket, including whether screenshots, printouts or a refreshed mobile code are accepted. If you experience a telephone or network failure, contact the helpdesk. We will provide reasonable assistance to verify your booking, subject to security checks. An unverifiable payment screenshot does not guarantee admission.",
    ],
  },
  {
    n: 8,
    paras: [
      "8.1 Tickets may be transferred only through a process expressly approved by Talanta Sports City, where that option is available, and subject to the ticket category restrictions disclosed at purchase. A completed approved transfer invalidates the sender’s admission credential and assigns the ticket to the recipient. Forwarding a ticket PDF, email, screenshot or QR code does not by itself constitute an approved transfer. The recipient must receive these terms and any applicable age or access restrictions.",
      "8.2 You must obtain our prior written permission before commercially reselling tickets, acting as a ticket broker, including tickets in resale packages, organising ticket giveaways or competitions, or using tickets in advertising. Corporate hospitality invitations are permitted within the agreed package and guest-list process.",
      "8.3 Complimentary, sponsor, partner, staff and accreditation passes carry only the rights stated on them. A pass supplied without payment does not carry a cash refund entitlement. If it forms part of a paid sponsorship or hospitality contract, any contractual remedy is assessed under that agreement and applicable law.",
    ],
  },
  {
    n: 9,
    paras: [
      "9.1 Use the entrance, arrival window and route shown on your ticket or official event information. Allow time for travel, queues, ticket validation and security checks. The final gate opening and last admission times will be published in the event information; a match time is not a gate-opening time.",
      "9.2 Late entry may be delayed or managed to avoid disruption and safety risks. Personal lateness or a missed programme segment does not ordinarily create a refund entitlement where the contracted event remains available. This does not excuse unreasonable admission failure caused by us.",
      "9.3 There is no re-entry once you voluntarily leave the controlled stadium perimeter. Emergency evacuation and an expressly authorised medical or accessibility arrangement will be managed separately. Movement between approved internal areas is permitted only within your ticket entitlement and the stewarded routes.",
    ],
  },
  {
    n: 10,
    paras: [
      "10.1 MANAGEMENT RESERVES THE RIGHT OF ADMISSION. We may reasonably refuse entry, suspend access or require a person to leave for a lawful and proportionate reason connected with ticket validity, safety, security, capacity, safeguarding or a serious or repeated breach of these terms.",
      "10.2 Grounds include a forged, cancelled or inapplicable ticket; entry to an unauthorised category; refusal of reasonable screening; possession of prohibited items; violent, threatening, discriminatory or seriously disruptive conduct; dangerous intoxication; an applicable lawful exclusion; or conduct presenting a credible safety risk.",
      "10.3 Admission and removal decisions will not unlawfully discriminate or be used to suppress a legitimate complaint. Where safe and practicable, staff will explain the reason, allow a reasonable opportunity to correct a minor breach and escalate disputed cases to a supervisor. Immediate removal may be appropriate where delay creates a risk.",
      "10.4 Where exclusion results from your established serious breach, a refund will not ordinarily be due for services you cannot use, subject to law and a fair assessment. Where a valid guest is refused without a proper basis or because we cannot provide the contracted admission, we will offer an appropriate remedy, including a refund where required. Physical intervention must be lawful and proportionate.",
    ],
  },
  {
    n: 11,
    paras: [
      "11.1 A ticket and reasonable identity or concession verification may be required. We collect only the information necessary for the stated check. Any requirement for named tickets or specific identification documents will be communicated in advance, with a reasonable assistance route for genuine difficulties.",
      "11.2 All guests and belongings may be subject to ticket checks, metal detection, visual bag inspection and other lawful screening at the assembly point, shuttle and stadium. Screening may be repeated after a security incident or movement between controlled zones.",
      "11.3 Searches must respect dignity, privacy, disability, age and religious needs. Ask for a supervisor or private screening where appropriate. Staff will explain reasonable alternatives for mobility aids, medical devices and other sensitive items; guests should not be required to abandon necessary aids merely for convenience.",
      "11.4 Refusal of necessary, lawful and reasonably conducted screening may result in refusal of entry. These terms do not grant staff unlimited powers to detain you, search private device contents, seize property or demand deletion of recordings. Police and authorised officers act under their applicable legal powers.",
    ],
  },
  {
    n: 12,
    paras: [
      "12.1 Do not bring firearms, ammunition, knives, offensive weapons, explosives, fireworks, flares, smoke devices, laser pointers, hazardous chemicals or illegal substances. Replica weapons or objects reasonably likely to cause alarm or be used as weapons may also be refused.",
      "12.2 Unauthorised drones, remote-controlled devices, professional broadcast equipment, tripods, large camera rigs, selfie sticks, hard poles, oversized banners, air horns and devices causing dangerous obstruction or excessive disturbance are prohibited unless expressly approved. Small personal cameras and phones are subject to the recording rules below.",
      "12.3 Glass containers, cans, large rigid containers, oversized luggage and furniture are prohibited. Outside food, drinks and alcohol are not permitted, subject to reasonable arrangements for medication, disability-related needs, infant feeding and medically necessary diets. Any specific bag dimensions or clear-bag requirement will be published before sale or notified as an objectively necessary safety update.",
      "12.4 Cigarettes, cigars, tobacco products, vapes and related smoking materials are prohibited under this event policy. Animals are not admitted except approved assistance animals and authorised working animals, subject to lawful access arrangements.",
      "12.5 You may be asked to remove, surrender or return a prohibited item before entry. No storage service is guaranteed. We will explain any arrangements for voluntary surrender, temporary custody, return or disposal. Illegal or dangerous items may be referred to police. We will not destroy lawful property without a lawful basis or your agreement.",
    ],
  },
  {
    n: 13,
    paras: [
      "13.1 A guest’s bodyguard, driver, aide or other privately engaged security person has no automatic entry entitlement. Any such person entering must hold a valid ticket for the same category or a specific approved accreditation permitting the required access. They count toward the permitted occupancy.",
      "13.2 Privately carried firearms and weapons are not permitted on event shuttles or inside the stadium, including where the carrier holds a firearm licence. Make arrangements before attending; we do not provide a public firearm storage service. Do not bring a weapon to a checkpoint expecting an exception.",
      "13.3 Official on-duty law enforcement and protective services are subject to applicable law and an agreed security command protocol. Any lawful official exception must be arranged through the designated security command, not negotiated by a guest or private guard at a public entrance.",
    ],
  },
  {
    n: 14,
    paras: [
      "14.1 Treat guests, staff, players, artists, officials and contractors with respect. Violence, threats, harassment, sexual misconduct, discriminatory abuse, hate speech, deliberate intimidation and conduct endangering others are prohibited.",
      "14.2 Do not throw objects, fight, invade the pitch or stage, interfere with equipment, climb barriers, obstruct views persistently, block routes or enter restricted working areas. Do not interfere with sporting play, performers, emergency responders or security operations.",
      "14.3 Do not tamper with fire systems, emergency equipment, seats, lighting, broadcast equipment or property. Damage and cleaning claims must be based on evidence and reasonable costs. Civil recovery, ticket restrictions or referral to authorities may follow a substantiated incident.",
      "14.4 Report harassment, a missing child, suspicious conduct or an unsafe situation promptly to a steward or the assistance team. Do not confront a person where doing so may escalate danger. Recording or publishing a vulnerable person’s medical emergency or a child in distress is prohibited where it infringes privacy or safeguarding requirements.",
    ],
  },
  {
    n: 15,
    paras: [
      "15.1 Use only the seat, standing zone, hospitality area and access routes allocated to your ticket. No ticket gives access to the pitch, dressing rooms, media facilities, backstage areas or another skybox unless expressly stated.",
      "15.2 We may relocate guests for a genuine safety, production, accessibility or operational reason, using reasonably comparable or better accommodation where available. An unavoidable materially inferior replacement will be explained and an appropriate price adjustment, alternative or refund considered.",
      "15.3 Stay within posted occupancy limits. Keep aisles, wheelchair spaces, escape routes and stairs clear. Do not stand on seats, sit on barriers or lean over balcony edges. Temporary sightline changes from routine play or spectator movement differ from a material restriction we knew about and should have disclosed.",
    ],
  },
  {
    n: 16,
    paras: [
      "16.1 For this event, guests below 18 must attend with a responsible adult aged 18 or above, unless a separately published supervised youth arrangement applies. The adult must hold a valid ticket for the same area, remain responsible for supervision and comply with safeguarding instructions.",
      "16.2 Each guest, including a child, must have their own valid admission entitlement. Any infant exemption, child price, minimum age, adult-to-child supervision ratio or restricted area will be expressly published before purchase. An adult cannot waive a child’s statutory rights.",
      "16.3 Skyboxes and hospitality areas may serve alcohol to eligible adults. Adults bringing minors must consider whether the setting and programme are suitable and supervise them throughout. No alcohol may be supplied to anyone under 18. Age verification may be required without excessive retention of identity documents.",
      "16.4 Photography of children for targeted promotional use requires the appropriate parent or guardian authorisation and safeguarding assessment. A purchaser who is not the child’s parent or legal guardian cannot automatically provide that authorisation.",
    ],
  },
  {
    n: 17,
    paras: [
      "17.1 Accessible seating, companion arrangements and access routes will be described on the booking page or through the assistance contact. Tell us what support you need as early as reasonably possible. Advance notice helps planning but does not remove your legal rights if notice is late.",
      "17.2 Request approval for essential medication, oxygen, mobility equipment, assistance animals or medically necessary food through the assistance channel. Only proportionate supporting information may be requested. Staff will offer reasonable screening arrangements for essential items.",
      "17.3 We handle medical and accessibility information confidentially, with access limited to people who need it to deliver assistance. Do not send detailed medical records to public groups, ordinary guest lists or unrelated commercial teams.",
      "17.4 Emergency medical assistance will be available through the event response team. Treatment decisions, transfer to hospital and any separately chargeable third-party care are subject to applicable consent and clinical requirements. The event is not a substitute for an individual care plan.",
    ],
  },
  {
    n: 18,
    paras: [
      "18.1 The production may include loud sound, strobe lighting, flashing lights, smoke or haze effects and intense visual effects. These may trigger seizures in people with photosensitive epilepsy or cause discomfort for guests with sensory sensitivities. Seek professional advice where appropriate and contact us about available assistance.",
      "18.2 The venue may expose guests to heat, rain, sun, uneven surfaces, stairs and large crowds. Wear suitable footwear, hydrate, follow official weather instructions and use approved hearing protection where appropriate. Guests may ask stewards for help if unwell or distressed.",
      "18.3 Any legally required health or public-safety measure will be communicated as clearly and early as practicable. A new requirement that materially prevents lawful attendance will be reviewed under the changes and refund provisions; this clause does not authorise arbitrary health-data collection.",
    ],
  },
  {
    n: 19,
    paras: [
      "19.1 Smoking and vaping are prohibited throughout the stadium and event-managed shuttles, including skyboxes, washrooms and circulation areas. There is no entitlement to leave for smoking and then re-enter.",
      "19.2 Alcohol may be sold or served only in authorised areas and within permitted operating conditions. Service may be refused to an underage or intoxicated person or where safety requires it. A package including alcohol does not promise unrestricted quantities or override responsible service.",
      "19.3 Food and beverage service times, menus, included quantities and premium exclusions follow the purchased package. Ingredient and allergen information will be made available through catering staff. Raise allergies early, but do not assume a completely allergen-free environment unless expressly confirmed.",
      "19.4 Outside food and drinks are restricted as set out in the prohibited-items clause. We will make reasonable arrangements for necessary dietary and medical exceptions. You will not be required to consume a substitute food or drink that is unsafe for you.",
    ],
  },
  {
    n: 20,
    paras: [
      "20.1 You may take ordinary personal photographs and brief personal clips using a phone or permitted small camera, provided the event information does not specify a justified rights-holder restriction and you do not obstruct, harass or endanger others.",
      "20.2 Full-match or full-performance recording, live streaming, real-time redistribution, commercial filming, monetised broadcasts and systematic transmission of sporting data require written authorisation. A personal ticket does not grant media rights or a licence to exploit the event commercially.",
      "20.3 Professional equipment, tripods, telephoto rigs and additional lighting require approval. Respect other guests’ privacy, especially in washrooms, medical spaces, security screening and family areas. Do not photograph security-sensitive infrastructure in a manner that compromises safety.",
      "20.4 If unauthorised recording occurs, staff may ask you to stop, seek a supervisor, restrict access or use other lawful remedies. This ticket does not automatically transfer ownership of every photograph you take to us, and does not authorise staff to search your device or delete files without a lawful basis.",
    ],
  },
  {
    n: 21,
    paras: [
      "21.1 Official photographers, broadcasters and production teams may record the event, spectators and venue, including crowd scenes, audience reactions and incidental appearances on screens, live broadcasts, news reports and event records. Entry areas will carry notices and the privacy notice will explain purposes, recipients and lawful bases. Where consent is relied on for identifiable crowd images or livestreams, separate express consent will be sought with a practical opt-out process. Attendance or signage alone is not express consent.",
      "21.2 General event coverage is not a blanket consent to use an identifiable guest as a spokesperson or endorsement for a sponsor. Where express consent is required for commercial use of personal data or a recognisable close-up in advertising, we will obtain a separate, specific authorisation before that use. Purchasing a ticket is not mandatory agreement to unrelated sponsor advertising.",
      "21.3 Where we request an optional image release, it will identify the intended campaign, users, channels, duration and any payment or absence of payment. Refusing optional promotional filming will not by itself affect admission. We will not imply an endorsement you have not agreed to give.",
      "21.4 For a privacy or safeguarding concern about photography or filming, contact ticketing@talantasportscity.com before the event or speak to a steward on the day. We will assess practical measures, such as directing official photographers away from you or avoiding selected close-ups, but cannot promise that you will never appear incidentally in a live crowd shot. Rights requests will be handled under applicable law, including any applicable journalism or artistic-expression rules.",
      "21.5 Separate safeguards apply to children and vulnerable people. Facial recognition, biometric identification or automated profiling is not authorised merely by this photography clause and would require its own lawful basis, transparency and safeguards.",
    ],
  },
  {
    n: 22,
    paras: [
      "22.1 Personal data may be processed for booking, payment verification, ticket delivery, fraud prevention, access control, safety, incident response and customer support. Our Privacy Notice, available through www.talantasportscity.com, explains the relevant data controllers and contacts, purposes, lawful bases, data categories, recipients, retention periods or criteria, international transfers and your rights. Privacy enquiries may be sent to ticketing@talantasportscity.com.",
      "22.2 CCTV and other proportionate security monitoring may operate in public and controlled areas for safety and incident investigation. Monitoring will not be placed in spaces where guests reasonably expect intimate privacy. Relevant footage may be shared with competent authorities or authorised investigators where lawful.",
      "22.3 We will share information only where necessary and lawful with event delivery providers, ticketing and payment providers, emergency services, authorised rights holders or authorities. Sponsors do not automatically receive the full purchaser or guest database because they sponsor the event. Any international transfer must satisfy applicable Kenyan safeguards.",
      "22.4 Optional direct marketing requires the appropriate separate choice and an effective opt-out. Transactional messages about your booking, safety or event changes are distinct from marketing. Consent to one purpose is not consent to every future campaign.",
      "22.5 You may exercise applicable rights to information, access, correction, objection, deletion and withdrawal of consent through the privacy contact, subject to lawful exceptions and identity verification. You may complain to the Office of the Data Protection Commissioner. Withdrawal does not retroactively invalidate lawful processing; we will explain any lawful limits on deletion of incident, legal or transaction records.",
    ],
  },
  {
    n: 23,
    paras: [
      "23.1 Journalists, photographers, influencers and production crews undertaking professional coverage must obtain accreditation and comply with its scope. A hospitality invitation or ordinary ticket is not media accreditation or player-access permission.",
      "23.2 Unauthorised sales, collections, canvassing, promotional installations, sponsored displays, product distribution and ambush marketing are prohibited within controlled event areas. Ordinary personal clothing or lawful personal expression is not automatically a commercial activation.",
      "23.3 Event, club, artist, sponsor and venue names, logos and protected content remain subject to their owners’ rights. Purchasing a ticket or skybox does not grant naming rights, advertising rights, athlete endorsements, broadcast clips or rights to use the event to promote a competing product.",
    ],
  },
  {
    n: 24,
    paras: [
      "24.1 Your written package specifies the skybox number or category, approved capacity, price, service window and inclusions. The name used for a skybox is a guest identifier and does not create ownership, a lease, permanent naming rights or a continuing entitlement after the booked event.",
      "24.2 The approved capacity includes all admitted guests, including children, aides and private security personnel using the space. Staff employed to service the box are managed under the venue’s separate operating and safety limits. Do not invite extra guests on the assumption that standing space increases capacity.",
      "24.3 Provide guest details through the approved secure process by the deadline in your booking confirmation. Guest substitutions must use the official process. We request only information needed for a defined purpose and will explain any operational need for nationality or official-protocol details.",
      "24.4 Each guest must hold the correct ticket and any required hospitality tag or wristband. A relationship manager or escort will assist with the approved arrival process. Their assistance does not authorise bypassing screening, public-safety controls or ticket checks.",
      "24.5 Lunch, dinner, soft drinks and any listed alcoholic beverages are supplied only as described in the purchased package. Premium liquor, additional bottles, special menus and other extras may be separately chargeable if agreed in advance. No promise of player meetings, backstage access, photographs with teams or special gifts arises unless expressly confirmed in writing.",
    ],
  },
  {
    n: 25,
    paras: [
      "25.1 Use furnishings, screens, washrooms and other facilities responsibly. Do not move fixtures, mount signs, install equipment, attach decorations, alter wiring, bring outside caterers or conduct a commercial activation without written approval. Keep doors, balconies and escape routes within safety instructions.",
      "25.2 A host may be asked to nominate one authorised contact for guest coordination and approved extras. Charges must be supported by the agreed order and pricing; the existence of a host contact does not permit unlimited additional billing.",
      "25.3 We may reasonably substitute a menu item or service element with one of comparable quality, taking account of dietary requirements. A material reduction in the package will be addressed with a suitable alternative, adjustment or refund rather than a blanket right to substitute anything.",
      "25.4 Damage deposits, cleaning charges or incidental authorisations apply only if disclosed and agreed. Any deduction must be itemised, evidence-based and proportionate, with a route to challenge it. Normal wear and tear is not chargeable damage.",
    ],
  },
  {
    n: 26,
    paras: [
      "26.1 Under the skybox arrival arrangement, guest vehicles must report to Ulinzi Sports Stadium at the location and time in the final arrival instructions. No guest parking is provided at Talanta Sports City under this arrangement. Do not drive to a restricted stadium entrance expecting admission or parking.",
      "26.2 Skybox guests will use pre-accredited shuttles, subject to ticket verification, screening and the communicated boarding arrangements. Guests from each skybox are to return together, with return service commencing approximately 30 minutes after the match. Final departure windows and contingency arrangements will be communicated before the event.",
      "26.3 Shuttle passengers must follow safety instructions and must not carry firearms, outside alcohol or dangerous items. Drivers and private escorts who do not have a ticket cannot accompany guests into restricted event areas. Accessibility requirements should be raised early so suitable transport can be planned.",
      "26.4 Transport times are estimates affected by traffic and security operations. Tell the transport team promptly if stranded, separated or delayed. We remain responsible for the contracted transport obligations we undertake; using a third-party carrier does not automatically remove those obligations. Separately booked transport is governed by the identified supplier’s terms.",
    ],
  },
  {
    n: 27,
    paras: [
      "27.1 The event information identifies confirmed teams, match format, performers and hospitality benefits and distinguishes any provisional content. A named club does not guarantee particular players, a first-team squad or a specific playing duration unless expressly sold on that basis.",
      "27.2 Player availability, substitutions, artistic set lists, running order and nonessential timings may change. Routine changes do not ordinarily justify a refund where the event remains materially as sold. If an essential advertised feature changes, the remedies in clauses 27.3 and 28 apply.",
      "27.3 If a headline team withdraws, the core match is replaced, the venue changes materially or another essential advertised feature is removed, we will assess whether the change is material and notify purchasers of available remedies. A broad “line-up subject to change” statement does not remove rights arising from a substantially different event.",
      "27.4 We will communicate material changes through www.talantasportscity.com and the available booking contacts. Notices will explain the change, alternatives, refund process and relevant deadlines. Lack of engagement on social media alone will not be treated as agreement to a materially different contract.",
    ],
  },
  {
    n: 28,
    paras: [
      "28.1 If the event is cancelled and you do not accept a replacement event, we will refund the ticket price attributable to the cancelled admission and the price of undelivered contracted services. Processing fees are non-refundable except in the circumstances set out in clause 4.4. We will explain the treatment of any genuinely separate service already supplied.",
      "28.2 If the event is postponed or moved, we will state whether your ticket remains valid and provide an appropriate opportunity to accept the revised arrangement or seek a refund where the change is material or law requires it. A credit note or voucher will not be imposed in place of a cash refund to which you are entitled.",
      "28.3 If the programme is interrupted, shortened or abandoned after starting, we will assess the services delivered, the significance of any missing component, any resumption and applicable law. We will communicate any rescheduled arrangements, price adjustment or refund available. Any processing fee will be treated in accordance with clause 4.4.",
      "28.4 Severe weather, security threats, public-authority restrictions, infrastructure failure and other events outside reasonable control may require suspension or cancellation. We will take reasonable steps to mitigate their effects and communicate promptly. Such circumstances do not automatically eliminate rights to repayment for undelivered services.",
    ],
  },
  {
    n: 29,
    paras: [
      "29.1 Unless the offer expressly includes an exchange or cancellation option, personal change of mind, inability to travel, illness or a missed event does not ordinarily create a contractual refund entitlement. Any statutory cancellation, misrepresentation, defective-performance or other mandatory remedy remains available.",
      "29.2 For a refund or booking problem, email ticketing@talantasportscity.com with your order reference and details of the issue. We may request proportionate verification but will not demand unnecessary banking credentials or a full identity-document copy without justification. Keep your ticket until the claim is resolved.",
      "29.3 Eligible refunds are ordinarily returned to the original payer through the original payment method. If this is not possible, we will agree a secure alternative after verification. A forwarded ticket does not entitle another guest to receive the purchaser’s refund without verified authorisation. Processing fees are treated in accordance with clause 4.4; duplicate or excess payments will be corrected under clause 5.4.",
      "29.4 We will acknowledge your claim, explain eligibility and provide a payment timetable. Approved refunds will be initiated within 14 calendar days after necessary verification, or sooner where law requires. We will explain genuine delays; payment-network processing time does not excuse indefinite inaction.",
      "29.5 A claim deadline will be reasonable and clearly communicated. Missing an administrative deadline does not remove a statutory right. Refunds, compensation and chargebacks will be reconciled to prevent duplicate repayment, without restricting your lawful recourse to a payment provider or regulator.",
    ],
  },
  {
    n: 30,
    paras: [
      "30.1 Spectator attendance involves ordinary risks such as crowd movement, weather, loud sound and an occasional ball or object leaving the field of play. Take reasonable care, remain alert and follow safety directions. Acknowledging ordinary risks does not waive rights arising from unsafe management or unlawful conduct.",
      "30.2 We will exercise the standard of care and supply the quality of service required by law. Nothing in these terms excludes liability that cannot lawfully be excluded, including applicable liability for death or personal injury caused by negligence, fraud, deliberate wrongdoing or breach of non-excludable consumer rights.",
      "30.3 We are not responsible for a loss caused solely by your own misconduct or an independent third party where we have no legal responsibility. Keep personal belongings secure. We remain responsible for loss or damage to the extent our acts, omissions or those of persons for whom we are legally responsible cause it.",
      "30.4 Travel, accommodation and loss of business are not automatically included in a ticket refund. Any claim for additional losses will be assessed under applicable law, including the cause of the loss, whether it was reasonably foreseeable and the reasonable steps taken to limit it. Nothing in these terms limits a remedy that cannot lawfully be excluded.",
      "30.5 If you deliberately or negligently cause loss or damage, you may be required to pay the reasonable, evidenced amount for which you are legally responsible. You are not required to compensate us for loss caused by our own negligence or wrongdoing.",
    ],
  },
  {
    n: 31,
    paras: [
      "31.1 Follow instructions from authorised stewards, security, medical staff and emergency responders. Move calmly, keep exit routes clear and proceed to the designated assembly point if directed. Do not return to collect property during an evacuation.",
      "31.2 Management may temporarily restrict movement, close a zone, suspend service or relocate guests to protect safety. We will provide reasonable assistance to children, disabled guests and people requiring support. Emergency directions do not predetermine whether a refund is due.",
      "31.3 Report lost property through the official helpdesk. Collection may require proof of ownership. Storage, retention and disposal periods will be published or explained when an item is logged. Personal data found in lost property must be handled securely. Suspected weapons or unlawful items will be referred appropriately.",
    ],
  },
  {
    n: 32,
    paras: [
      "32.1 Use the ticketing site lawfully. Do not interfere with queues, security, payment systems, other accounts or website availability. Do not scrape restricted customer information or attempt to access another guest’s booking.",
      "32.2 We do not guarantee uninterrupted internet, mobile reception or website access. If an outage affects a booking or admission, we will investigate and provide reasonable assistance and any remedy required by law. Technical failure does not authorise retaining payment for a service we cannot supply.",
      "32.3 Official communications will use the site, booking email or telephone details and other channels identified in the event information. Check important messages and report suspected impersonation. We will not request your PIN, password or one-time payment authorisation code through ordinary support messages.",
    ],
  },
  {
    n: 33,
    paras: [
      "33.1 Send service complaints to ticketing@talantasportscity.com and retain your order, correspondence and supporting information. On the day, ask a steward or hospitality relationship manager for a supervisor where immediate resolution is possible.",
      "33.2 We will acknowledge your complaint and explain the next steps and expected response time. Send privacy or image-use complaints to ticketing@talantasportscity.com, stating the nature of your concern so it can be directed to the appropriate team. You may also seek urgent relief, use lawful payment remedies or contact a competent regulator.",
      "33.3 Kenyan law governs these terms. You may bring a dispute before a court or tribunal with lawful jurisdiction. Mediation is available if both parties agree. Nothing in these terms removes any mandatory legal protection or right of access to the courts.",
      "33.4 If a clause is invalid or unenforceable, the remainder applies to the extent it can fairly operate. Failure to enforce one breach is not a waiver of all future breaches. No variation takes away rights that have already accrued.",
    ],
  },
  {
    n: 34,
    paras: [
      "34.1 The version accepted when you book governs your purchase. We may issue proportionate operational or safety updates for legitimate reasons, with reasonable notice where possible. A material adverse commercial change requires the appropriate agreement or remedy; continued website use alone is not consent to every future revision.",
      "34.2 For ticketing, refunds, complaints, privacy and image-use requests, accessibility assistance or pre-event medical coordination, contact ticketing@talantasportscity.com. Use www.talantasportscity.com for official event information and any additional published support channels. On the day, speak to a steward, the event helpdesk or a medical responder for immediate assistance. For an emergency, seek urgent help from the nearest authorised responder and contact the appropriate emergency services.",
      "34.3 By selecting the purchase acceptance box, you confirm that you have been able to review these terms, check the event and booking details and correct errors before paying. Optional marketing and promotional image choices are separate. Guests must comply with the notified lawful entry conditions when attending.",
    ],
  },
];

export default function TicketingTerms() {
  const [active, setActive] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      let current = 1;
      for (const s of SECTIONS) {
        const el = document.getElementById(`sec-${s.n}`);
        if (el && el.getBoundingClientRect().top <= 140) current = s.n;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const jump = (n) => {
    const el = document.getElementById(`sec-${n}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <Link to="/" className="text-sm text-ink-muted hover:text-ink">
          ← Back
        </Link>
        <h1 className="text-2xl sm:text-4xl font-extrabold mt-3 mb-2">
          Talanta Sports City Ticketing and Admission Terms
        </h1>
        <p className="text-sm text-ink-muted">
          Stadium events and skybox hospitality · Effective 1 November 2026 · Updated 4 November 2026
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-20 h-fit">
          <div className="bg-surface border border-surface-line rounded-xl p-5">
            <h2 className="text-xs uppercase tracking-wider text-ink-muted mb-3">Contents</h2>
            <ol className="space-y-1 text-xs">
              {SECTIONS.map((s) => (
                <li key={s.n}>
                  <button
                    onClick={() => jump(s.n)}
                    className={`text-left w-full flex gap-2 py-1 px-2 rounded transition ${
                      active === s.n
                        ? "bg-kenya-gold/10 text-kenya-gold font-semibold"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    <span className="text-ink-muted shrink-0 w-5">{s.n}</span>
                    <span>{s.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-4 bg-surface border border-surface-line rounded-xl p-5 text-xs text-ink-muted space-y-1.5">
            <div><span className="text-ink-muted">Event owner:</span> <span className="text-ink">Ministry of Sports</span></div>
            <div><span className="text-ink-muted">Organiser:</span> <span className="text-ink">Talanta Sports City</span></div>
            <div><span className="text-ink-muted">Website:</span> <a href="https://www.talantasportscity.com" className="text-kenya-gold hover:underline">www.talantasportscity.com</a></div>
            <div><span className="text-ink-muted">Support:</span> <a href="mailto:ticketing@talantasportscity.com" className="text-kenya-gold hover:underline">ticketing@talantasportscity.com</a></div>
          </div>
        </aside>

        <article className="space-y-10 text-sm text-ink-muted leading-relaxed">
          <p className="text-ink-muted">
            These terms govern the purchase, transfer and use of tickets and admission to Talanta
            Sports City events, including skybox hospitality. Read them before paying, share them
            with every guest in your booking and retain your order confirmation and the terms
            supplied with it.
          </p>

          {CONTENT.map((sec) => (
            <section key={sec.n} id={`sec-${sec.n}`} className="scroll-mt-24">
              <h2 className="text-lg font-bold text-ink mb-3">
                {sec.n}. {SECTIONS.find((s) => s.n === sec.n)?.title}
              </h2>
              <div className="space-y-3">
                {sec.paras.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}

          <div className="bg-surface border border-surface-line rounded-xl p-6 text-center text-xs text-ink-muted">
            <p className="text-ink font-semibold mb-1">Talanta Sports City</p>
            <p>Official ticketing · www.talantasportscity.com</p>
            <p className="mt-2">© 2026 Talanta Sports City · Ngong Rd, Nairobi</p>
          </div>
        </article>
      </div>
    </div>
  );
}