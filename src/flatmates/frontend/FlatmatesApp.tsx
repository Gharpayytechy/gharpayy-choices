// @ts-nocheck
/**
 * Flatmates FRONTEND — standalone app.
 * Self-contained wouter app mounted at /gharpayy. Every screen, component and
 * data port lives under src/flatmates/, independent of the main site.
 */
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/referral-app/components/ui/toaster";
import { TooltipProvider } from "@/referral-app/components/ui/tooltip";

import FMOnboard from "@/flatmates/frontend/pages/onboard";
import FMHome from "@/flatmates/frontend/pages/home";
import FMDiscover from "@/flatmates/frontend/pages/discover";
import FMPost from "@/flatmates/frontend/pages/post";
import FMRoom from "@/flatmates/frontend/pages/room";
import FMPerson from "@/flatmates/frontend/pages/person";
import FMFlat from "@/flatmates/frontend/pages/flat";
import FMInterest, { NotForMe as FMNotForMe, MutualPage as FMMutual } from "@/flatmates/frontend/pages/interest";
import FMInbox, { Chat as FMChat } from "@/flatmates/frontend/pages/inbox";
import FMGroups, { GroupRoom as FMGroupRoom } from "@/flatmates/frontend/pages/groups";
import FMSchedule, { SafetyPage as FMSafety } from "@/flatmates/frontend/pages/schedule";
import FMYou from "@/flatmates/frontend/pages/you";
import FMNotifications from "@/flatmates/frontend/pages/notifications";
import FMMeetings from "@/flatmates/frontend/pages/meetings";
import FMHousehold from "@/flatmates/frontend/pages/household";
import FMSearch from "@/flatmates/frontend/pages/search";
import FMTrust from "@/flatmates/frontend/pages/trust";
import FMReady from "@/flatmates/frontend/pages/ready";
import FMMatchCenter from "@/flatmates/frontend/pages/match-center";
import FMRequirement from "@/flatmates/frontend/pages/requirement";
import FMLiquidity from "@/flatmates/frontend/pages/liquidity";
import FMSaved from "@/flatmates/frontend/pages/saved";
import FMHub from "@/flatmates/frontend/pages/hub";
import FMDeals from "@/flatmates/frontend/pages/deals";
import FMMoveout from "@/flatmates/frontend/pages/moveout";
import FMAgreement from "@/flatmates/frontend/pages/agreement";

import AdminCommand from "@/flatmates/frontend/admin/command";
import AdminSupply from "@/flatmates/frontend/admin/supply";
import AdminDemand from "@/flatmates/frontend/admin/demand";
import AdminOwners from "@/flatmates/frontend/admin/owners";
import AdminMissions from "@/flatmates/frontend/admin/missions";

const queryClient = new QueryClient();

function FlatmatesNotFound() {
  return (
    <div className="min-h-[100dvh] grid place-items-center bg-background text-foreground px-6 text-center">
      <div>
        <p className="font-display text-2xl font-semibold">Page not found</p>
        <p className="text-sm text-muted-foreground mt-1">This Flatmates screen does not exist.</p>
        <a href="/gharpayy/flatmates" className="inline-block mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          Back to Flatmates
        </a>
      </div>
    </div>
  );
}

function FlatmatesRoutes() {
  return (
    <Switch>
      {/* Admin (most specific first) */}
      <Route path="/flatmates/admin" component={AdminCommand} />
      <Route path="/flatmates/admin/supply" component={AdminSupply} />
      <Route path="/flatmates/admin/demand" component={AdminDemand} />
      <Route path="/flatmates/admin/owners" component={AdminOwners} />
      <Route path="/flatmates/admin/missions" component={AdminMissions} />

      {/* App */}
      <Route path="/flatmates" component={FMHome} />
      <Route path="/flatmates/onboard" component={FMOnboard} />
      <Route path="/flatmates/start" component={FMOnboard} />
      <Route path="/flatmates/discover" component={FMDiscover} />
      <Route path="/flatmates/post" component={FMPost} />
      <Route path="/flatmates/room/:id" component={FMRoom} />
      <Route path="/flatmates/person/:id" component={FMPerson} />
      <Route path="/flatmates/flat/:id" component={FMFlat} />
      <Route path="/flatmates/interest/:kind/:id" component={FMInterest} />
      <Route path="/flatmates/not-for-me/:kind/:id" component={FMNotForMe} />
      <Route path="/flatmates/mutual/:id" component={FMMutual} />
      <Route path="/flatmates/inbox" component={FMInbox} />
      <Route path="/flatmates/chat/:id" component={FMChat} />
      <Route path="/flatmates/groups" component={FMGroups} />
      <Route path="/flatmates/group/:id" component={FMGroupRoom} />
      <Route path="/flatmates/schedule" component={FMSchedule} />
      <Route path="/flatmates/safety" component={FMSafety} />
      <Route path="/flatmates/you" component={FMYou} />
      <Route path="/flatmates/notifications" component={FMNotifications} />
      <Route path="/flatmates/meetings" component={FMMeetings} />
      <Route path="/flatmates/household" component={FMHousehold} />
      <Route path="/flatmates/search" component={FMSearch} />
      <Route path="/flatmates/trust" component={FMTrust} />
      <Route path="/flatmates/ready" component={FMReady} />
      <Route path="/flatmates/saved" component={FMSaved} />
      <Route path="/flatmates/liquidity" component={FMLiquidity} />
      <Route path="/flatmates/requirement" component={FMRequirement} />
      <Route path="/flatmates/you/requirement" component={FMRequirement} />
      <Route path="/flatmates/match/:kind/:id" component={FMMatchCenter} />
      <Route path="/flatmates/hub" component={FMHub} />
      <Route path="/flatmates/deals" component={FMDeals} />
      <Route path="/flatmates/moveout" component={FMMoveout} />
      <Route path="/flatmates/agreement" component={FMAgreement} />

      <Route component={FlatmatesNotFound} />
    </Switch>
  );
}

export default function FlatmatesApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <WouterRouter base="/gharpayy">
          <FlatmatesRoutes />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
