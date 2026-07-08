import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";


let browserInstance = null;


async function getBrowser() {

    if (!browserInstance) {

        browserInstance = await playwright.launch({
            args: [
                ...chromium.args,
                "--disable-dev-shm-usage",
            ],
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });


        browserInstance.on("disconnected", () => {
            browserInstance = null;
        });

    }

    return browserInstance;
}
export const config = {
    api: {
        responseLimit: false
    }
};

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    let browser;
    let context;
    let page;

    try {

        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: "URL required"
            });
        }

        browser = await getBrowser();

        context = await browser.newContext();

        page = await context.newPage();

        let graphqlUrl = null;
        let graphqlHeaders = {};
        let graphqlBody = null;

        const allAds = [];
        const seenAds = new Set();

        const formatAd = (adObj) => {

            const snapshot = adObj.snapshot || {};

            return {
                adId: adObj.ad_archive_id,
                pageId: adObj.page_id,
                pageName: snapshot.page_name || "",
                pageProfileImage: snapshot.page_profile_picture_url || "",
                pageCategories: snapshot.page_categories || [],
                pageLikes: snapshot.page_like_count || 0,
                body: snapshot.body?.text || "",
                title: snapshot.title || "",
                description: snapshot.link_description || "",
                caption: snapshot.caption || "",
                ctaText: snapshot.cta_text || "",
                ctaType: snapshot.cta_type || "",
                landingPage: snapshot.link_url || "",
                displayFormat: snapshot.display_format || "",
                images: snapshot.images || [],
                videos: snapshot.videos?.map(v => ({
                    preview: v.video_preview_image_url,
                    hd: v.video_hd_url,
                    sd: v.video_sd_url
                })) || []
            };

        };


        page.on("request", request => {

            if (
                !request.url().includes("/api/graphql") ||
                request.method() !== "POST"
            ) {
                return;
            }

            const body = request.postData() || "";

            const params = new URLSearchParams(body);

            const name = params.get(
                "fb_api_req_friendly_name"
            );

            if (name === "AdLibrarySearchPaginationQuery") {

                graphqlUrl = request.url();

                graphqlHeaders = {
                    ...request.headers()
                };

                graphqlBody = body;
            }

        });


        await page.goto(url, {
            waitUntil: "commit",
            timeout: 120000
        });


        await page.waitForLoadState(
            "domcontentloaded"
        ).catch(() => { });


        let attempts = 0;

        while (!graphqlBody && attempts < 40) {

            try {

                await page.mouse.wheel(0, 3000);

                await page.waitForTimeout(400);

            } catch { }

            attempts++;

        }


        if (!graphqlBody) {

            return res.status(200).json({
                success: true,
                totalAds: 0,
                data: []
            });

        }



        let hasNextPage = true;
        let cursor = null;
        let pageCount = 0;



        while (hasNextPage) {


            let body = graphqlBody;


            const params = new URLSearchParams(body);


            const variablesRaw = params.get("variables");


            if (variablesRaw) {

                const variables = JSON.parse(
                    variablesRaw
                );


                if (cursor) {
                    variables.cursor = cursor;
                } else {
                    delete variables.cursor;
                }


                params.set(
                    "variables",
                    JSON.stringify(variables)
                );


                body = params.toString();

            }


            let response;


            try {

                response = await page.evaluate(

                    async ({ url, headers, body }) => {

                        delete headers["content-length"];
                        delete headers["host"];
                        delete headers["cookie"];

                        const res = await fetch(url, {
                            method: "POST",
                            headers,
                            body,
                            credentials: "include"
                        });

                        return await res.text();

                    },

                    {
                        url: graphqlUrl,
                        headers: graphqlHeaders,
                        body
                    }

                );

            } catch {

                break;

            }


            let json;

            try {

                json = JSON.parse(response);

            } catch (err) {

                console.log(
                    "Facebook invalid response"
                );

                break;
            }


            const edges =
                json?.data
                    ?.ad_library_main
                    ?.search_results_connection
                    ?.edges || [];



            for (const edge of edges) {

                const results =
                    edge?.node?.collated_results || [];


                for (const adObj of results) {


                    if (
                        !adObj.ad_archive_id ||
                        seenAds.has(adObj.ad_archive_id)
                    ) {
                        continue;
                    }


                    seenAds.add(
                        adObj.ad_archive_id
                    );


                    allAds.push(
                        formatAd(adObj)
                    );

                }

            }



            const pageInfo =
                json?.data
                    ?.ad_library_main
                    ?.search_results_connection
                    ?.page_info;



            if (!pageInfo) {
                break;
            }



            cursor = pageInfo.end_cursor;

            hasNextPage = pageInfo.has_next_page;

            pageCount++;

        }



        return res.status(200).json({
            success: true,
            totalAds: allAds.length,
            pageCount,
            data: allAds
        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {

        if (context) {
            await context.close();
        }

    }

}