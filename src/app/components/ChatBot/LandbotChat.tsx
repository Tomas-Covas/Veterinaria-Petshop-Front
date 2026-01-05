import Script from 'next/script';
const LandbotChat = () => (
    <Script
        id="landbot-original-logic"
        dangerouslySetInnerHTML={{
            __html: `
                var myLandbot;
                function initLandbot() {
                    if (!myLandbot) {
                        var s = document.createElement('script');
                        s.type = "module"
                        s.async = true;
                        s.addEventListener('load', function() {
                            myLandbot = new Landbot.Livechat({
                                configUrl: 'https://storage.googleapis.com/landbot.online/v3/H-3278025-WS8PVRP9Y3HXM5S8/index.json',
                            });
                        });
                        s.src = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';
                        var x = document.getElementsByTagName('script')[0];
                        x.parentNode.insertBefore(s, x);
                    }
                }
                // Escuchar eventos para carga diferida (Landbot original)
                window.addEventListener('mouseover', initLandbot, { once: true });
                window.addEventListener('touchstart', initLandbot, { once: true });
            `,
        }}
       
        strategy="afterInteractive" 
    />
);
export default LandbotChat;

