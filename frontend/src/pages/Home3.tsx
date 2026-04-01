import TradingViewWidget from "@/components/ui/TradingViewWidget";
import {
    HEATMAP_WIDGET_CONFIG,
    MARKET_DATA_WIDGET_CONFIG,
    MARKET_OVERVIEW_WIDGET_CONFIG,
    TOP_STORIES_WIDGET_CONFIG
} from "@/lib/constants";

const Home3 = () => {
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

    return (
        <div className="flex flex-col h-full w-full overflow-y-auto home-wrapper p-6 bg-[#000510]">
            <div className="mb-8">
                <h1 className="text-3xl font-black italic text-primary uppercase tracking-tighter">Market Intelligence</h1>
                <p className="text-white/40 text-sm font-medium">Real-time global market monitoring and advanced analytics.</p>
            </div>

            <section className="grid w-full gap-8 grid-cols-1 xl:grid-cols-3 mb-8">
                <div className="xl:col-span-1">
                    <TradingViewWidget title="Market Overview"
                        scriptUrl={`${scriptUrl}market-overview.js`}
                        config={MARKET_OVERVIEW_WIDGET_CONFIG}
                        height={500}
                    />
                </div>
                <div className="xl:col-span-2">
                    <TradingViewWidget title="Stock Heatmap"
                        scriptUrl={`${scriptUrl}stock-heatmap.js`}
                        config={HEATMAP_WIDGET_CONFIG}
                        height={500}
                    />
                </div>
            </section>

            <section className="grid w-full gap-8 grid-cols-1 xl:grid-cols-3">
                <div className="xl:col-span-1">
                    <TradingViewWidget title="Top Stories"
                        scriptUrl={`${scriptUrl}timeline.js`}
                        config={TOP_STORIES_WIDGET_CONFIG}
                        height={500}
                    />
                </div>
                <div className="xl:col-span-2">
                    <TradingViewWidget title="Market Quotes"
                        scriptUrl={`${scriptUrl}market-quotes.js`}
                        config={MARKET_DATA_WIDGET_CONFIG}
                        height={500}
                    />
                </div>
            </section>
        </div>
    );
};

export default Home3;
