const MESSAGES = [
    { delay: 0, text: "Incoming transmission..." },
    { delay: 1200, text: "Lorem ipsum dolor sit amet." },
    { delay: 2200, text: "Ut enim ad minim veniam." },
    { delay: 3600, text: "Duis aute irure dolor..." },
    { delay: 5200, text: "Excepteur sint occaecat cupidatat non proident?" }
];

$(document).ready(function() {
    const $container = $("#container");
    const $message = $("#message");
    let $animate = $("#animate").hide(); // Hide the button initially

    function scramble(element, text, options, isLast) {
        const settings = $.extend({
            probability: 0.2,
            glitches: '-|/\\',
            blank: '',
            duration: text.length * 40,
            ease: 'easeInOutQuad',
            delay: 0.0
        }, options);

        const glitches = settings.glitches.split('').map(glitch => `<span class="glitch">${glitch}</span>`);
        let output = text.split('').map(char => `<span class="ghost">${char}</span>`);

        $(element).html(output.join(''));
        $(element).delay(settings.delay).animate({ opacity: 1 }, {
            duration: settings.duration,
            step: function(now, fx) {
                let glitchIndex = Math.floor(Math.random() * glitches.length);
                let charIndex = Math.floor(Math.random() * text.length);
                output[charIndex] = Math.random() < settings.probability ? glitches[glitchIndex] : `<span>${text[charIndex]}</span>`;
                $(this).html(output.join(''));
            },
            complete: function() {
                $(this).html(text);
                if (isLast) {
                    $animate.fadeIn(); // Show the button after the last message
                }
            }
        });
    }

    function animate() {
        MESSAGES.forEach((data, index) => {
            const element = $('<p/>').appendTo($message);
            scramble(element[0], data.text, { delay: data.delay }, index === MESSAGES.length - 1);
        });
    }
    
    animate();
});
