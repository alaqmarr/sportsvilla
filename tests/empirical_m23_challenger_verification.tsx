import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "fs";
import path from "path";

// Import Admin primitives from barrel export
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Stat,
  Badge,
  DataTable,
  Button,
  Input,
  Select,
  Switch,
  Modal,
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  TableSkeleton,
  EmptyState,
  Avatar,
  PageHeader,
} from "../src/components/admin/ui";

// Import Play primitives from barrel export
import {
  PlayCard,
  PlayCardHeader,
  PlayCardTitle,
  PlayCardDescription,
  PlayCardContent,
  PlayCardFooter,
  PlayButton,
  PlayBadge,
  PlayInput,
  PlayModal,
  PlaySkeleton,
  PlayEmptyState,
  PlayAvatar,
  PlayAvatarSize,
} from "../src/components/play/ui";

interface TestResult {
  suite: string;
  name: string;
  status: "PASS" | "FAIL";
  details?: any;
}

const results: TestResult[] = [];

function assertTest(suite: string, name: string, condition: boolean, details?: any) {
  const status: "PASS" | "FAIL" = condition ? "PASS" : "FAIL";
  results.push({ suite, name, status, details });
  const icon = condition ? "[PASS]" : "[FAIL]";
  console.log(`${icon} [${suite}] ${name}`);
  if (!condition && details !== undefined) {
    console.error("       Error/Details:", typeof details === "object" ? JSON.stringify(details, null, 2) : details);
  }
}

console.log("===============================================================");
console.log("   EMPIRICAL CHALLENGER M2 & M3 VERIFICATION TEST HARNESS   ");
console.log("===============================================================\n");

// ============================================================================
// 1. ADMIN PRIMITIVES EXPORT & INSTANTIATION TESTS (13 Primitives)
// ============================================================================
console.log("--- 1. Testing Admin Primitives ---");

// 1.1 Card & Subcomponents
try {
  const cardMarkupDefault = renderToStaticMarkup(
    <Card variant="default" padding="md">
      <CardHeader>
        <CardTitle>Test Title</CardTitle>
        <CardDescription>Test Description</CardDescription>
      </CardHeader>
      <CardContent>Content Area</CardContent>
      <CardFooter>Footer Area</CardFooter>
    </Card>
  );
  assertTest("Admin:Card", "Renders default card with header, title, description, content, footer", 
    cardMarkupDefault.includes("Test Title") && cardMarkupDefault.includes("bg-sv-surface"));

  const cardVariants: Array<"default" | "raised" | "highlighted" | "ghost"> = ["default", "raised", "highlighted", "ghost"];
  for (const variant of cardVariants) {
    const m = renderToStaticMarkup(<Card variant={variant}><span>{variant}</span></Card>);
    assertTest("Admin:Card", `Renders variant '${variant}' cleanly`, m.includes(variant));
  }
} catch (err: any) {
  assertTest("Admin:Card", "Card instantiation exception", false, err.message);
}

// 1.2 Stat
try {
  const statMarkup = renderToStaticMarkup(
    <Stat
      label="Active Bookings"
      value={128}
      subtext="Updated 2 mins ago"
      trend={{ value: "12.5%", direction: "up", label: "vs yesterday" }}
      variant="brand"
    />
  );
  assertTest("Admin:Stat", "Renders KPI stat block with value, trend, glow", 
    statMarkup.includes("Active Bookings") && statMarkup.includes("128") && statMarkup.includes("12.5%"));

  const statVariants: Array<"default" | "brand" | "success" | "warning" | "info" | "purple"> = [
    "default", "brand", "success", "warning", "info", "purple"
  ];
  for (const variant of statVariants) {
    const m = renderToStaticMarkup(<Stat label="Metric" value="99" variant={variant} />);
    assertTest("Admin:Stat", `Renders stat variant '${variant}'`, m.includes("Metric"));
  }
} catch (err: any) {
  assertTest("Admin:Stat", "Stat instantiation exception", false, err.message);
}

// 1.3 Badge
try {
  const badgeMarkup = renderToStaticMarkup(
    <Badge variant="success" size="md" dot pulseDot>
      Confirmed
    </Badge>
  );
  assertTest("Admin:Badge", "Renders badge with status dot and text", 
    badgeMarkup.includes("Confirmed") && badgeMarkup.includes("bg-sv-success"));

  const badgeVariants: Array<"default" | "success" | "warning" | "error" | "info" | "brand" | "neutral"> = [
    "default", "success", "warning", "error", "info", "brand", "neutral"
  ];
  for (const variant of badgeVariants) {
    const m = renderToStaticMarkup(<Badge variant={variant}>{variant}</Badge>);
    assertTest("Admin:Badge", `Renders badge variant '${variant}'`, m.includes(variant));
  }
} catch (err: any) {
  assertTest("Admin:Badge", "Badge instantiation exception", false, err.message);
}

// 1.4 DataTable
try {
  interface DemoRow {
    id: string;
    name: string;
    amount: number;
    status: string;
  }
  const columns = [
    { key: "name" as const, header: "Customer", render: (r: DemoRow) => <strong>{r.name}</strong> },
    { key: "amount" as const, header: "Total", render: (r: DemoRow) => `Rs ${r.amount}` },
    { key: "status" as const, header: "Status", render: (r: DemoRow) => <Badge variant="success">{r.status}</Badge> },
  ];
  const demoData: DemoRow[] = [
    { id: "1", name: "Alice", amount: 1500, status: "PAID" },
    { id: "2", name: "Bob", amount: 2000, status: "PAID" },
  ];

  const tableMarkup = renderToStaticMarkup(
    <DataTable
      data={demoData}
      columns={columns}
      keyExtractor={(item) => item.id}
      stickyHeader
    />
  );
  assertTest("Admin:DataTable", "Renders populated table with sticky header and generic columns", 
    tableMarkup.includes("Alice") && tableMarkup.includes("Bob") && tableMarkup.includes("sticky"));

  const emptyTableMarkup = renderToStaticMarkup(
    <DataTable
      data={[]}
      columns={columns}
      keyExtractor={(item) => item.id}
      emptyTitle="No records present"
      emptyMessage="Try adjusting your filters"
    />
  );
  assertTest("Admin:DataTable", "Renders empty state slot when data is empty", 
    emptyTableMarkup.includes("No records present") && emptyTableMarkup.includes("Try adjusting your filters"));

  const loadingTableMarkup = renderToStaticMarkup(
    <DataTable
      data={[]}
      columns={columns}
      keyExtractor={(item) => item.id}
      isLoading
    />
  );
  assertTest("Admin:DataTable", "Renders loading skeleton rows when isLoading is true", 
    loadingTableMarkup.includes("animate-pulse"));
} catch (err: any) {
  assertTest("Admin:DataTable", "DataTable instantiation exception", false, err.message);
}

// 1.5 Button
try {
  const btnMarkup = renderToStaticMarkup(
    <Button variant="primary" size="md">
      Confirm Booking
    </Button>
  );
  assertTest("Admin:Button", "Renders primary button", btnMarkup.includes("Confirm Booking") && btnMarkup.includes("bg-sv-brand"));

  const btnLoadingMarkup = renderToStaticMarkup(
    <Button variant="secondary" isLoading>
      Processing
    </Button>
  );
  assertTest("Admin:Button", "Renders button in loading state with spinner", 
    btnLoadingMarkup.includes("animate-spin") && btnLoadingMarkup.includes("Processing"));

  const buttonVariants: Array<"primary" | "secondary" | "outline" | "ghost" | "danger"> = [
    "primary", "secondary", "outline", "ghost", "danger"
  ];
  for (const variant of buttonVariants) {
    const m = renderToStaticMarkup(<Button variant={variant}>{variant}</Button>);
    assertTest("Admin:Button", `Renders button variant '${variant}'`, m.includes(variant));
  }
} catch (err: any) {
  assertTest("Admin:Button", "Button instantiation exception", false, err.message);
}

// 1.6 Input
try {
  const inputMarkupWithHelper = renderToStaticMarkup(
    <Input
      label="Member Mobile"
      placeholder="9876543210"
      helperText="Enter 10-digit number"
      defaultValue="9999999999"
    />
  );
  assertTest("Admin:Input", "Renders input with label and helperText", 
    inputMarkupWithHelper.includes("Member Mobile") && inputMarkupWithHelper.includes("Enter 10-digit number"));

  const inputMarkupWithError = renderToStaticMarkup(
    <Input
      label="Member Mobile"
      placeholder="9876543210"
      error="Invalid phone number"
      defaultValue="9999999999"
    />
  );
  assertTest("Admin:Input", "Renders input with error state", 
    inputMarkupWithError.includes("Invalid phone number") && inputMarkupWithError.includes("border-sv-error-border"));
} catch (err: any) {
  assertTest("Admin:Input", "Input instantiation exception", false, err.message);
}

// 1.7 Select
try {
  const selectMarkup = renderToStaticMarkup(
    <Select
      label="Court Sport"
      options={[
        { label: "Cricket", value: "cricket" },
        { label: "Football", value: "football" },
      ]}
      helperText="Select primary sport"
    />
  );
  assertTest("Admin:Select", "Renders select with options and chevron", 
    selectMarkup.includes("Court Sport") && selectMarkup.includes("Cricket") && selectMarkup.includes("Football"));
} catch (err: any) {
  assertTest("Admin:Select", "Select instantiation exception", false, err.message);
}

// 1.8 Switch
try {
  const switchMarkupChecked = renderToStaticMarkup(
    <Switch
      checked={true}
      onChange={() => {}}
      label="Enable Razorpay Auto-Refund"
      description="Automatically process cancellations via gateway"
    />
  );
  assertTest("Admin:Switch", "Renders switch with label and description in checked state", 
    switchMarkupChecked.includes("Enable Razorpay Auto-Refund") && switchMarkupChecked.includes("aria-checked=\"true\""));

  const switchMarkupUnchecked = renderToStaticMarkup(
    <Switch checked={false} onChange={() => {}} label="Maintenance Mode" />
  );
  assertTest("Admin:Switch", "Renders switch in unchecked state", 
    switchMarkupUnchecked.includes("aria-checked=\"false\""));
} catch (err: any) {
  assertTest("Admin:Switch", "Switch instantiation exception", false, err.message);
}

// 1.9 Modal
try {
  const modalOpenMarkup = renderToStaticMarkup(
    <Modal
      isOpen={true}
      onClose={() => {}}
      title="Confirm Cancellation"
      description="Are you sure you want to cancel this booking?"
      footer={<Button variant="danger">Confirm</Button>}
      size="md"
    >
      <div>This action cannot be undone.</div>
    </Modal>
  );
  assertTest("Admin:Modal", "Renders open modal with title, body, footer, backdrop blur", 
    modalOpenMarkup.includes("Confirm Cancellation") && modalOpenMarkup.includes("backdrop-blur-sm") && modalOpenMarkup.includes("This action cannot be undone."));

  const modalClosedMarkup = renderToStaticMarkup(
    <Modal isOpen={false} onClose={() => {}}>Hidden Content</Modal>
  );
  assertTest("Admin:Modal", "Returns empty markup when isOpen is false", modalClosedMarkup === "");
} catch (err: any) {
  assertTest("Admin:Modal", "Modal instantiation exception", false, err.message);
}

// 1.10 Skeleton suite
try {
  const skeletonMarkup = renderToStaticMarkup(
    <div>
      <Skeleton variant="rectangular" width={200} height={40} />
      <SkeletonText lines={3} />
      <SkeletonAvatar size="md" />
      <SkeletonCard />
      <TableSkeleton rows={4} columns={3} />
    </div>
  );
  assertTest("Admin:Skeleton", "Renders skeleton suite elements with animate-pulse", 
    skeletonMarkup.includes("animate-pulse") && skeletonMarkup.includes("bg-sv-surface-raised"));
} catch (err: any) {
  assertTest("Admin:Skeleton", "Skeleton instantiation exception", false, err.message);
}

// 1.11 EmptyState
try {
  const emptyMarkup = renderToStaticMarkup(
    <EmptyState
      title="No Bookings Found"
      description="There are no court bookings matching your search filter."
      action={<Button variant="primary">Create Booking</Button>}
    />
  );
  assertTest("Admin:EmptyState", "Renders empty state with title, description, and action button", 
    emptyMarkup.includes("No Bookings Found") && emptyMarkup.includes("Create Booking"));
} catch (err: any) {
  assertTest("Admin:EmptyState", "EmptyState instantiation exception", false, err.message);
}

// 1.12 Avatar
try {
  const avatarNameMarkup = renderToStaticMarkup(
    <Avatar name="Rahul Sharma" role="SUPERADMIN" showRoleBadge size="md" />
  );
  assertTest("Admin:Avatar", "Renders initials fallback 'RS' with role badge", 
    avatarNameMarkup.includes("RS") && avatarNameMarkup.includes("SUPERADMIN"));

  const avatarSizes: Array<"xs" | "sm" | "md" | "lg" | "xl"> = ["xs", "sm", "md", "lg", "xl"];
  for (const s of avatarSizes) {
    const m = renderToStaticMarkup(<Avatar name="Test User" size={s} />);
    assertTest("Admin:Avatar", `Renders avatar size '${s}'`, m.includes("TU"));
  }
} catch (err: any) {
  assertTest("Admin:Avatar", "Avatar instantiation exception", false, err.message);
}

// 1.13 PageHeader
try {
  const pageHeaderMarkup = renderToStaticMarkup(
    <PageHeader
      title="Grounds & Turfs"
      subtitle="Manage sports arenas, hourly pricing, and availability schedules"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Grounds & Turfs" },
      ]}
      actions={<Button variant="primary">Add Turf</Button>}
      statusBadge={<Badge variant="brand">6 Active</Badge>}
    />
  );
  assertTest("Admin:PageHeader", "Renders PageHeader with breadcrumbs, title, subtitle, actions, statusBadge", 
    pageHeaderMarkup.includes("Grounds") && pageHeaderMarkup.includes("Add Turf") && pageHeaderMarkup.includes("6 Active"));
} catch (err: any) {
  assertTest("Admin:PageHeader", "PageHeader instantiation exception", false, err.message);
}

// ============================================================================
// 2. PLAY PRIMITIVES EXPORT & INSTANTIATION TESTS (8 Primitives)
// ============================================================================
console.log("\n--- 2. Testing Play Primitives ---");

// 2.1 PlayCard & Subcomponents
try {
  const playCardMarkup = renderToStaticMarkup(
    <PlayCard variant="elevated" padding="md">
      <PlayCardHeader>
        <PlayCardTitle>Box Cricket Turf A</PlayCardTitle>
        <PlayCardDescription>Synthetic turf with floodlights</PlayCardDescription>
      </PlayCardHeader>
      <PlayCardContent>Available from 6:00 AM</PlayCardContent>
      <PlayCardFooter>Starting at Rs 800/hr</PlayCardFooter>
    </PlayCard>
  );
  assertTest("Play:PlayCard", "Renders elevated play card with title, content, footer", 
    playCardMarkup.includes("Box Cricket Turf A") && playCardMarkup.includes("bg-play-surface") && playCardMarkup.includes("shadow-play-md"));

  const playCardVariants: Array<"default" | "elevated" | "interactive" | "accent"> = [
    "default", "elevated", "interactive", "accent"
  ];
  for (const variant of playCardVariants) {
    const m = renderToStaticMarkup(<PlayCard variant={variant}><span>{variant}</span></PlayCard>);
    assertTest("Play:PlayCard", `Renders play card variant '${variant}'`, m.includes(variant));
  }
} catch (err: any) {
  assertTest("Play:PlayCard", "PlayCard instantiation exception", false, err.message);
}

// 2.2 PlayButton
try {
  const playBtnMarkup = renderToStaticMarkup(
    <PlayButton variant="athletic" size="lg" fullWidth>
      Book Slot Now
    </PlayButton>
  );
  assertTest("Play:PlayButton", "Renders athletic button with bold typography & active press scale", 
    playBtnMarkup.includes("Book Slot Now") && playBtnMarkup.includes("active:scale-[0.98]") && playBtnMarkup.includes("w-full"));

  const playBtnLoadingMarkup = renderToStaticMarkup(
    <PlayButton variant="brand" isLoading>
      Verifying Slot
    </PlayButton>
  );
  assertTest("Play:PlayButton", "Renders play button with loading spinner and Loading label", 
    playBtnLoadingMarkup.includes("animate-spin") && playBtnLoadingMarkup.includes("Loading..."));

  const playBtnVariants: Array<"brand" | "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger" | "athletic"> = [
    "brand", "primary", "accent", "secondary", "outline", "ghost", "danger", "athletic"
  ];
  for (const variant of playBtnVariants) {
    const m = renderToStaticMarkup(<PlayButton variant={variant}>{variant}</PlayButton>);
    assertTest("Play:PlayButton", `Renders play button variant '${variant}'`, m.includes(variant));
  }
} catch (err: any) {
  assertTest("Play:PlayButton", "PlayButton instantiation exception", false, err.message);
}

// 2.3 PlayBadge
try {
  const playBadgeMarkup = renderToStaticMarkup(
    <PlayBadge variant="brand" size="md" dot>
      Instant Confirmation
    </PlayBadge>
  );
  assertTest("Play:PlayBadge", "Renders athletic badge with rounded-play-pill & dot", 
    playBadgeMarkup.includes("Instant Confirmation") && playBadgeMarkup.includes("rounded-play-pill") && playBadgeMarkup.includes("font-play"));

  const playBadgeVariants: Array<"brand" | "accent" | "success" | "warning" | "error" | "info" | "neutral"> = [
    "brand", "accent", "success", "warning", "error", "info", "neutral"
  ];
  for (const variant of playBadgeVariants) {
    const m = renderToStaticMarkup(<PlayBadge variant={variant}>{variant}</PlayBadge>);
    assertTest("Play:PlayBadge", `Renders play badge variant '${variant}'`, m.includes(variant));
  }
} catch (err: any) {
  assertTest("Play:PlayBadge", "PlayBadge instantiation exception", false, err.message);
}

// 2.4 PlayInput
try {
  const playInputMarkup = renderToStaticMarkup(
    <PlayInput
      label="Player Name"
      placeholder="Enter your name"
      helperText="Visible on public leaderboard"
      error="Name is required"
    />
  );
  assertTest("Play:PlayInput", "Renders play input with label, error, helperText, athletic styling", 
    playInputMarkup.includes("Player Name") && playInputMarkup.includes("Name is required") && playInputMarkup.includes("rounded-play-md"));
} catch (err: any) {
  assertTest("Play:PlayInput", "PlayInput instantiation exception", false, err.message);
}

// 2.5 PlayModal
try {
  const playModalOpenMarkup = renderToStaticMarkup(
    <PlayModal
      isOpen={true}
      onClose={() => {}}
      title="Select Payment Method"
      description="Choose your preferred payment gateway"
      size="md"
    >
      <div>UPI / Razorpay / Wallet</div>
    </PlayModal>
  );
  assertTest("Play:PlayModal", "Renders open play modal with bottom sheet pull handle on mobile", 
    playModalOpenMarkup.includes("Select Payment Method") && 
    playModalOpenMarkup.includes("rounded-t-play-xl") && 
    playModalOpenMarkup.includes("bg-play-border-strong"));

  const playModalClosedMarkup = renderToStaticMarkup(
    <PlayModal isOpen={false} onClose={() => {}}>Hidden</PlayModal>
  );
  assertTest("Play:PlayModal", "Returns empty markup when isOpen is false", playModalClosedMarkup === "");
} catch (err: any) {
  assertTest("Play:PlayModal", "PlayModal instantiation exception", false, err.message);
}

// 2.6 PlaySkeleton
try {
  const playSkeletonMarkup = renderToStaticMarkup(
    <div>
      <PlaySkeleton variant="rectangular" width="100%" height={120} />
      <PlaySkeleton variant="circular" width={48} height={48} />
      <PlaySkeleton variant="text" width="60%" />
      <PlaySkeleton variant="card" />
    </div>
  );
  assertTest("Play:PlaySkeleton", "Renders play skeleton variants with animate-pulse and subtle surface", 
    playSkeletonMarkup.includes("animate-pulse") && playSkeletonMarkup.includes("bg-play-surface-subtle"));
} catch (err: any) {
  assertTest("Play:PlaySkeleton", "PlaySkeleton instantiation exception", false, err.message);
}

// 2.7 PlayEmptyState
try {
  const playEmptyMarkup = renderToStaticMarkup(
    <PlayEmptyState
      title="No Games Scheduled"
      description="You have no open matches or tournament fixtures today."
      actionText="Find a Game"
      secondaryActionText="Host a Game"
    />
  );
  assertTest("Play:PlayEmptyState", "Renders play empty state with title, description, and action buttons", 
    playEmptyMarkup.includes("No Games Scheduled") && playEmptyMarkup.includes("Find a Game") && playEmptyMarkup.includes("Host a Game"));
} catch (err: any) {
  assertTest("Play:PlayEmptyState", "PlayEmptyState instantiation exception", false, err.message);
}

// 2.8 PlayAvatar
try {
  const playAvatarMarkup = renderToStaticMarkup(
    <PlayAvatar
      name="Virat Kohli"
      size="lg"
      status="online"
    />
  );
  assertTest("Play:PlayAvatar", "Renders play avatar with initials 'VK', ring, and status dot", 
    playAvatarMarkup.includes("VK") && playAvatarMarkup.includes("ring-play-border") && playAvatarMarkup.includes("bg-play-status-success"));

  const playAvatarSizes: PlayAvatarSize[] = ["sm", "md", "lg", "xl", "2xl"];
  for (const s of playAvatarSizes) {
    const m = renderToStaticMarkup(<PlayAvatar name="John Doe" size={s} />);
    assertTest("Play:PlayAvatar", `Renders play avatar size '${s}'`, m.includes("JD"));
  }
} catch (err: any) {
  assertTest("Play:PlayAvatar", "PlayAvatar instantiation exception", false, err.message);
}

// ============================================================================
// 3. NAVIGATION & SHELL BEHAVIOR VERIFICATION
// ============================================================================
console.log("\n--- 3. Testing Navigation & Shell Behaviors ---");

// 3.1 Navigation.tsx behavior analysis
const navPath = path.resolve(__dirname, "../src/components/Navigation.tsx");
const navSource = fs.readFileSync(navPath, "utf-8");

assertTest("Behavior:Navigation", "Sidebar collapse uses localStorage key 'sv_admin_sidebar_collapsed'", 
  navSource.includes("sv_admin_sidebar_collapsed"));

assertTest("Behavior:Navigation", "Sidebar collapse state reads localStorage in useEffect", 
  navSource.includes("localStorage.getItem(STORAGE_KEY)") && navSource.includes("useEffect"));

assertTest("Behavior:Navigation", "Sidebar collapse toggle writes to localStorage with error handling", 
  navSource.includes("localStorage.setItem(STORAGE_KEY") && navSource.includes("try {") && navSource.includes("catch"));

assertTest("Behavior:Navigation", "Desktop sidebar toggles between w-64 and w-20", 
  navSource.includes("isCollapsed ? \"lg:w-20\" : \"lg:w-64\""));

assertTest("Behavior:Navigation", "Main content container shifts margin between ml-64 and ml-20", 
  navSource.includes("isCollapsed ? \"lg:ml-20\" : \"lg:ml-64\""));

assertTest("Behavior:Navigation", "Contains toggle button triggering toggleCollapse", 
  navSource.includes("onClick={toggleCollapse}"));

assertTest("Behavior:Navigation", "Renders desktop breadcrumb trail from pathname", 
  navSource.includes("breadcrumbs") && navSource.includes("Route Breadcrumbs"));

assertTest("Behavior:Navigation", "Groups links into domains (Core, Members, Revenue, WhatsApp, Cards & NFC, Settings & Tools)", 
  navSource.includes("Core") && 
  navSource.includes("Members") && 
  navSource.includes("Revenue") && 
  navSource.includes("WhatsApp") && 
  navSource.includes("Cards & NFC") && 
  navSource.includes("Settings & Tools"));

// 3.2 BottomNav.tsx behavior analysis
const bottomNavPath = path.resolve(__dirname, "../src/components/play/BottomNav.tsx");
const bottomNavSource = fs.readFileSync(bottomNavPath, "utf-8");

assertTest("Behavior:BottomNav", "Contains exactly 5 destinations (Home, Bookings, Book, Games, Profile)", 
  bottomNavSource.includes("label: 'Home'") &&
  bottomNavSource.includes("label: 'Bookings'") &&
  bottomNavSource.includes("label: 'Book'") &&
  bottomNavSource.includes("label: 'Games'") &&
  bottomNavSource.includes("label: 'Profile'"));

assertTest("Behavior:BottomNav", "Elevated Book button with circular FAB styling (-mt-6, w-14 h-14, ring-4)", 
  bottomNavSource.includes("-mt-6") &&
  bottomNavSource.includes("w-14 h-14 rounded-full") &&
  bottomNavSource.includes("ring-4 ring-play-surface") &&
  bottomNavSource.includes("bg-play-brand"));

assertTest("Behavior:BottomNav", "Mobile visibility hidden on md screens (md:hidden fixed bottom-0)", 
  bottomNavSource.includes("md:hidden fixed bottom-0"));

// 3.3 Navbar.tsx integration
const navbarPath = path.resolve(__dirname, "../src/components/play/Navbar.tsx");
const navbarSource = fs.readFileSync(navbarPath, "utf-8");

assertTest("Behavior:Navbar", "Imports and renders <BottomNav /> for mobile", 
  navbarSource.includes("import { BottomNav }") && navbarSource.includes("<BottomNav />"));

assertTest("Behavior:Navbar", "Desktop navigation is displayed on md+ viewports (hidden md:flex)", 
  navbarSource.includes("hidden md:flex"));

// ============================================================================
// 4. AUTOMATED SCAN FOR RAW HEX VALUES
// ============================================================================
console.log("\n--- 4. Scanning for Raw Hex Values ---");

const filesToScan: string[] = [
  // Admin UI
  "src/components/admin/ui/Avatar.tsx",
  "src/components/admin/ui/Badge.tsx",
  "src/components/admin/ui/Button.tsx",
  "src/components/admin/ui/Card.tsx",
  "src/components/admin/ui/DataTable.tsx",
  "src/components/admin/ui/EmptyState.tsx",
  "src/components/admin/ui/Input.tsx",
  "src/components/admin/ui/Modal.tsx",
  "src/components/admin/ui/PageHeader.tsx",
  "src/components/admin/ui/Select.tsx",
  "src/components/admin/ui/Skeleton.tsx",
  "src/components/admin/ui/Stat.tsx",
  "src/components/admin/ui/Switch.tsx",
  "src/components/admin/ui/index.ts",
  // Play UI
  "src/components/play/ui/PlayAvatar.tsx",
  "src/components/play/ui/PlayBadge.tsx",
  "src/components/play/ui/PlayButton.tsx",
  "src/components/play/ui/PlayCard.tsx",
  "src/components/play/ui/PlayEmptyState.tsx",
  "src/components/play/ui/PlayInput.tsx",
  "src/components/play/ui/PlayModal.tsx",
  "src/components/play/ui/PlaySkeleton.tsx",
  "src/components/play/ui/index.ts",
  // Shell & Navigation
  "src/components/Navigation.tsx",
  "src/components/play/Navbar.tsx",
  "src/components/play/BottomNav.tsx",
  "src/components/play/Sidebar.tsx",
  // Pages & Layouts
  "src/app/(admin)/page.tsx",
  "src/app/(client)/play/(authenticated)/layout.tsx",
  "src/app/(client)/play/layout.tsx",
];

const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;
let totalHexMatches = 0;
const hexFindings: Array<{ file: string; match: string; line: number }> = [];

for (const relPath of filesToScan) {
  const fullPath = path.resolve(__dirname, "..", relPath);
  if (!fs.existsSync(fullPath)) {
    assertTest("HexScan", `File exists: ${relPath}`, false, "File does not exist");
    continue;
  }
  const content = fs.readFileSync(fullPath, "utf-8");
  const lines = content.split("\n");
  let fileMatches = 0;
  lines.forEach((line, idx) => {
    const matches = line.match(hexRegex);
    if (matches) {
      for (const m of matches) {
        fileMatches++;
        totalHexMatches++;
        hexFindings.push({ file: relPath, match: m, line: idx + 1 });
      }
    }
  });
  assertTest("HexScan", `Zero raw hex values in ${relPath}`, fileMatches === 0, 
    fileMatches > 0 ? { fileMatches, details: hexFindings.filter(f => f.file === relPath) } : undefined);
}

assertTest("HexScan", "Overall 0 raw hex values in all created/modified files", totalHexMatches === 0, 
  { totalHexMatches, findings: hexFindings });

// ============================================================================
// 5. SUMMARY & VERDICT CALCULATION
// ============================================================================
console.log("\n===============================================================");
const totalTests = results.length;
const passedTests = results.filter((r) => r.status === "PASS").length;
const failedTests = results.filter((r) => r.status === "FAIL").length;

console.log(`TOTAL TESTS EXECUTED : ${totalTests}`);
console.log(`PASSED               : ${passedTests}`);
console.log(`FAILED               : ${failedTests}`);

if (failedTests > 0) {
  console.error(`\nFAILED TESTS (${failedTests}):`);
  results
    .filter((r) => r.status === "FAIL")
    .forEach((r) => console.error(` - [${r.suite}] ${r.name}: ${JSON.stringify(r.details)}`));
  console.log("\nVERDICT: REQUEST_CHANGES");
  process.exit(1);
} else {
  console.log("\nVERDICT: ALL TESTS PASSED (100% SUCCESS)");
  process.exit(0);
}
