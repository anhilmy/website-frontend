<template>
    <div>
        <header class="py-8 border-b border-sand-200 mb-8">
            <h1 class="font-heading text-3xl font-semibold text-bark-900 mb-2">Uses</h1>
            <p class="font-body text-bark-800 leading-relaxed">
                A rundown of the tools, hardware, and software I use daily.
            </p>
        </header>

        <section class="mb-10">
            <h2 class="font-heading text-xl font-semibold text-bark-900 mb-4">Editor &amp; Terminal</h2>
            <div class="bg-sand-100 rounded-lg p-5 border border-sand-200">
                <ul class="font-body text-bark-900 space-y-2 text-sm leading-relaxed">
                    <li><span class="font-semibold text-bark-800">Editor:</span> VS Code — my daily driver for
                        everything from Go to Vue.js</li>
                    <li><span class="font-semibold text-bark-800">Extensions:</span> Go, Pylance, Volar, GitLens, REST
                        Client, Docker</li>
                    <li><span class="font-semibold text-bark-800">Terminal:</span> Zsh + Oh My Zsh, mostly inside VS
                        Code's integrated terminal</li>
                    <li><span class="font-semibold text-bark-800">Font:</span> JetBrains Mono — clean, readable, great
                        ligatures</li>
                    <li><span class="font-semibold text-bark-800">Theme:</span> One Dark Pro</li>
                </ul>
            </div>
        </section>

        <section class="mb-10">
            <h2 class="font-heading text-xl font-semibold text-bark-900 mb-4">Languages &amp; Frameworks</h2>
            <div class="bg-sand-100 rounded-lg p-5 border border-sand-200">
                <ul class="font-body text-bark-900 space-y-2 text-sm leading-relaxed">
                    <li><span class="font-semibold text-bark-800">Primary:</span> Go — for backend services and APIs
                    </li>
                    <li><span class="font-semibold text-bark-800">Scripting &amp; data:</span> Python — automation,
                        analysis, quick tooling</li>
                    <li><span class="font-semibold text-bark-800">Frontend:</span> JavaScript / Vue.js — this site is
                        built with it</li>
                    <li><span class="font-semibold text-bark-800">ERP:</span> ERPNext / Frappe — customization and
                        integrations</li>
                    <li><span class="font-semibold text-bark-800">Messaging:</span> Kafka, gRPC — async systems and
                        service communication</li>
                </ul>
            </div>
        </section>

        <section class="mb-10">
            <h2 class="font-heading text-xl font-semibold text-bark-900 mb-4">DevOps &amp; Infrastructure</h2>
            <div class="bg-sand-100 rounded-lg p-5 border border-sand-200">
                <ul class="font-body text-bark-900 space-y-2 text-sm leading-relaxed">
                    <li><span class="font-semibold text-bark-800">Containers:</span> Docker — local dev, packaging
                        deployments</li>
                    <li><span class="font-semibold text-bark-800">Orchestration:</span> Kubernetes — production
                        deployments at work</li>
                    <li><span class="font-semibold text-bark-800">Web server:</span> Nginx — reverse proxy, SSL
                        termination</li>
                    <li><span class="font-semibold text-bark-800">Tunnel:</span> Cloudflare Tunnel — exposes this
                        RaspberryPi to the internet safely</li>
                    <li><span class="font-semibold text-bark-800">Self-hosted:</span> Everything on this domain runs on
                        a RaspberryPi at home</li>
                </ul>
            </div>
        </section>

        <section class="mb-10">
            <h2 class="font-heading text-xl font-semibold text-bark-900 mb-4">Hardware</h2>
            <div class="bg-sand-100 rounded-lg p-5 border border-sand-200">
                <ul class="font-body text-bark-900 space-y-2 text-sm leading-relaxed">
                    <li><span class="font-semibold text-bark-800">Laptop:</span> My main work machine</li>
                    <li><span class="font-semibold text-bark-800">Home server:</span> Raspberry Pi 4 (4GB) — runs this
                        website, WordPress, Nginx, and Cloudflare Tunnel</li>
                    <li><span class="font-semibold text-bark-800">Keyboard:</span> Whatever came with the setup — I
                        should upgrade this eventually</li>
                </ul>
            </div>
        </section>
    </div>
</template>
