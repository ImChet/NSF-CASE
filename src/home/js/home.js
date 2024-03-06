const MESSAGES = [
    { delay: 0, text: "It’s not a question of if, but when" },
    { delay: 1200, text: "Give a man an zero-day and he’ll have access for a day, teach a man to phish and he’ll have access for life" },
    { delay: 2200, text: "There are only two types of organizations, Those that have been hacked, and those that don’t know it yet" },
    { delay: 3600, text: "The most secure computer is the computer that’s off" },
    { delay: 5200, text: "If it’s smart, it’s vulnerable" }
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
