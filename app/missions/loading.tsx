export default function MissionsLoading() {
  return (
    <div className="flex flex-col gap-5 pb-4 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-2 pt-2">
        <div className="w-8 h-8 rounded-xl bg-[#e0d2b3]/50" />
        <div>
          <div className="h-5 w-24 bg-[#e0d2b3]/50 rounded-lg" />
          <div className="h-3 w-40 bg-[#e0d2b3]/30 rounded-md mt-1.5" />
        </div>
      </div>

      {/* Summary strip skeleton */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[#fffdf8] border border-[#e0d2b3] rounded-2xl px-3 py-3 flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-[#f3ead6]" />
            <div>
              <div className="h-4 w-8 bg-[#e0d2b3]/50 rounded-md" />
              <div className="h-2.5 w-14 bg-[#e0d2b3]/30 rounded-md mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Mission card skeletons */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-[#fffdf8] rounded-2xl border border-[#e0d2b3] p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f3ead6]" />
            <div className="flex-1">
              <div className="h-3.5 w-32 bg-[#e0d2b3]/50 rounded-md" />
              <div className="h-2.5 w-full bg-[#e0d2b3]/30 rounded-md mt-2" />
              <div className="h-2 w-3/4 bg-[#e0d2b3]/30 rounded-md mt-1.5" />
              <div className="h-2.5 bg-[#efe6d0] rounded-full mt-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
