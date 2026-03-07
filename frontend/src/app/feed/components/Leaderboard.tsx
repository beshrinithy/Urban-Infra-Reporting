export default function Leaderboard() {
    // Mock Leaderboard Data
    const topCitizens = [
        { id: 1, name: "Arjun Verma", points: 1250, badge: "🏆 Top Reporter", avatar: "👨‍💼" },
        { id: 2, name: "Priya Sharma", points: 980, badge: "🌟 Street Guardian", avatar: "👩‍⚕️" },
        { id: 3, name: "Rahul Singh", points: 845, badge: "🛡️ Infrastructure Hero", avatar: "👷" },
        { id: 4, name: "Anjali Gupta", points: 720, badge: "🌱 Eco Warrior", avatar: "👩‍🏫" },
    ];

    return (
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                        <span className="text-xl">🏆</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Civic Leaderboard</h3>
                        <p className="text-xs text-slate-500">Top contributors this month</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {topCitizens.map((citizen, index) => (
                        <div key={citizen.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 transition hover:bg-indigo-50 hover:border-indigo-100 group">
                            <div className="font-bold text-slate-400 w-4 text-center group-hover:text-indigo-500">{index + 1}</div>
                            <div className="text-2xl bg-white p-1 rounded-full shadow-sm">{citizen.avatar}</div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 text-sm">{citizen.name}</h4>
                                <p className="text-xs text-indigo-600 font-semibold">{citizen.badge}</p>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-slate-900">{citizen.points}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wide">Points</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500 mb-3">Earn points by reporting issues and getting upvotes!</p>
                    <button className="w-full py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition">
                        View Full Rankings
                    </button>
                </div>
            </div>

            {/* Mini Stats */}
            <div className="bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <h3 className="font-bold text-lg mb-1">Your Impact</h3>
                <p className="text-indigo-200 text-sm mb-6">Keep reporting to level up!</p>

                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-3xl font-bold">Level 1</div>
                        <div className="text-xs text-indigo-200 font-semibold uppercase tracking-wider">Citizen</div>
                    </div>
                    <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                        🌱
                    </div>
                </div>
                <div className="mt-4 w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 h-full w-1/3"></div>
                </div>
                <div className="mt-2 text-xs text-indigo-200 text-right">300 / 1000 pts</div>
            </div>
        </div>
    );
}
