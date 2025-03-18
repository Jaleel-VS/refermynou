import { createClient } from "@/utils/supabase/server";
import { ReferralForm } from "@/components/ReferralForm";

export default async function Home() {
  const supabase = await createClient();
  
  // Check for existing referrals count
  const { count } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true });
  
  const limitReached = count !== null && count >= 5;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Referral Program</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          {!limitReached && count !== null && (
            <span className="block mt-2 text-sm">
              {5 - count} {5 - count === 1 ? 'spot' : 'spots'} remaining
            </span>
          )}
        </p>
      </header>

      <ReferralForm limitReached={limitReached} />
    </div>
  );
}
