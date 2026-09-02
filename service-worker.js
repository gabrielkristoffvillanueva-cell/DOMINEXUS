/* =========================================================
   DOMINEXUS OFFLINE SERVICE WORKER
========================================================= */

const CACHE_NAME = "dominexus-v3";

const OFFLINE_FALLBACK = "./index.html";


/* =========================================================
   DOMINEXUS FILES TO CACHE
========================================================= */

const APP_FILES = [

    /* =========================
       MAIN WEBSITE
    ========================= */

    "./",
    "./index.html",
    "./front-page.css",
    "./front-page.js",
    "./school.css",
    "./school.html",
    "./creators.css",
    "./creators.html",
    "./qr-test.html",


    /* =========================
       STUDENT
    ========================= */

    "./student/student-login.html",
    "./student/student-login.css",
    "./student/student-login.js",

    "./student/student-dashboard.html",
    "./student/student-dashboard.css",
    "./student/student-dashboard.js",

    "./student/student-attendance.html",
    "./student/student-attendance.css",
    "./student/student-attendance.js",

    "./student/student-meetings.html",
    "./student/student-meetings.css",
    "./student/student-meetings.js",

    "./student/student-requests.html",
    "./student/student-requests.css",
    "./student/student-requests.js",

    "./student/student-settings.html",
    "./student/student-settings.css",
    "./student/student-settings.js",

    "./student/student-signup.html",
    "./student/student-signup.css",
    "./student/student-signup.js",

    "./student/student-change-password.html",

    "./student/student-profile.html",
    "./student/student-profile.css",
    "./student/student-profile.js",

    "./student/student-qr.html",
    "./student/student-qr.css",
    "./student/student-qr.js",


    /* =========================
       OFFICER
    ========================= */

    "./officer/officer-login.html",
    "./officer/officer-login.css",
    "./officer/officer-login.js",

    "./officer/officer-register.html",
    "./officer/officer-register.css",
    "./officer/officer-register.js",

    "./officer/officer-dashboard.html",
    "./officer/officer-dashboard.css",
    "./officer/officer-dashboard.js",

    "./officer/officer-meetings.html",
    "./officer/officer-meetings.css",
    "./officer/officer-meetings.js",

    "./officer/officer-attendance.html",
    "./officer/officer-attendance.css",
    "./officer/officer-attendance.js",

    "./officer/officer-members.html",
    "./officer/officer-members.css",
    "./officer/officer-members.js",

    "./officer/officer-requests.html",
    "./officer/officer-requests.css",
    "./officer/officer-requests.js",

    "./officer/officer-settings.html",
    "./officer/officer-settings.css",
    "./officer/officer-settings.js",

    "./officer/officer-popup.css",
    "./officer/officer-popup.js",


    /* =========================
       MODERATOR
    ========================= */

    "./moderator/moderator-login.html",
    "./moderator/moderator-login.js",

    "./moderator/moderator-dashboard.html",
    "./moderator/moderator-dashboard.css",
    "./moderator/moderator-dashboard.js",

    "./moderator/moderator-meetings.html",
    "./moderator/moderator-meetings.css",
    "./moderator/moderator-meetings.js",

    "./moderator/moderator-scanner.html",
    "./moderator/moderator-scanner.css",
    "./moderator/moderator-scanner.js",

    "./moderator/moderator-live-attendance.html",
    "./moderator/moderator-live-attendance.css",
    "./moderator/moderator-live-attendance.js",

    "./moderator/moderator-students.html",
    "./moderator/moderator-students.css",
    "./moderator/moderator-students.js",

    "./moderator/moderator-history.html",
    "./moderator/moderator-history.css",
    "./moderator/moderator-history.js",

    "./moderator/moderator-reports.html",
    "./moderator/moderator-reports.css",
    "./moderator/moderator-reports.js",

    "./moderator/moderator-alerts.html",
    "./moderator/moderator-alerts.css",
    "./moderator/moderator-alerts.js",

    "./moderator/moderator-participation.html",
    "./moderator/moderator-participation.css",
    "./moderator/moderator-participation.js"

];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener(
    "install",
    function (event) {

        console.log(
            "DOMINEXUS: Installing offline system..."
        );


        event.waitUntil(

            caches.open(
                CACHE_NAME
            ).then(
                async function (cache) {

                    /*
                     * Cache files individually.
                     *
                     * Promise.allSettled prevents one
                     * missing file from breaking the
                     * entire service worker.
                     */

                    const results =
                        await Promise.allSettled(

                            APP_FILES.map(
                                function (file) {

                                    return cache.add(
                                        file
                                    );

                                }
                            )

                        );


                    let successful = 0;
                    let failed = 0;


                    results.forEach(
                        function (result, index) {

                            if (
                                result.status ===
                                "fulfilled"
                            ) {

                                successful++;

                            } else {

                                failed++;

                                console.warn(
                                    "DOMINEXUS offline cache skipped:",
                                    APP_FILES[index]
                                );

                            }

                        }
                    );


                    console.log(
                        `DOMINEXUS offline cache: ${successful} cached, ${failed} skipped.`
                    );

                }
            )

        );


        self.skipWaiting();

    }
);


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener(
    "activate",
    function (event) {

        console.log(
            "DOMINEXUS: Activating offline system..."
        );


        event.waitUntil(

            caches.keys().then(
                function (cacheNames) {

                    return Promise.all(

                        cacheNames.map(
                            function (cacheName) {

                                if (
                                    cacheName !==
                                    CACHE_NAME
                                ) {

                                    console.log(
                                        "Deleting old cache:",
                                        cacheName
                                    );

                                    return caches.delete(
                                        cacheName
                                    );

                                }

                            }
                        )

                    );

                }
            )

        );


        self.clients.claim();

    }
);


/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
    "fetch",
    function (event) {

        /*
         * Only handle GET requests.
         */

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        event.respondWith(

            fetch(
                event.request
            )
            .then(
                function (response) {

                    /*
                     * Save successful responses
                     * for future offline use.
                     */

                    if (
                        response &&
                        response.status === 200 &&
                        response.type !== "opaque"
                    ) {

                        const responseClone =
                            response.clone();


                        caches.open(
                            CACHE_NAME
                        ).then(
                            function (cache) {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            }
                        );

                    }


                    return response;

                }
            )
            .catch(
                function () {

                    /*
                     * Internet unavailable.
                     *
                     * First try the exact cached
                     * resource.
                     */

                    return caches.match(
                        event.request
                    ).then(
                        function (cachedResponse) {

                            if (
                                cachedResponse
                            ) {

                                return cachedResponse;

                            }


                            /*
                             * If navigating to a page
                             * that wasn't cached, return
                             * the DOMINEXUS homepage.
                             */

                            if (
                                event.request.mode ===
                                "navigate"
                            ) {

                                return caches.match(
                                    OFFLINE_FALLBACK
                                );

                            }


                            /*
                             * Always return a valid
                             * Response.
                             */

                            return new Response(
                                "",
                                {
                                    status: 503,
                                    statusText:
                                        "Offline"
                                }
                            );

                        }
                    );

                }
            )

        );

    }
);