function jsonToHtml(paragraphs) {
    let html = '<div class="article">';

    paragraphs.forEach(paragraph => {
        if (paragraph.type === 'H3') {
            html += `<h3>${paragraph.text}</h3>`;
        } else if (paragraph.type === 'P') {
            html += `<p>${parseText(paragraph.text, paragraph.markups)}</p>`;
        }
        // 可以根据其他类型的段落扩展

    });

    html += '</div>';
    return html;
}

function parseText(text, markups) {
    let parsedText = text;

    markups.forEach(markup => {
        if (markup.type === 'A') {
            const link = `<a href="${markup.href}" target="_blank">${parsedText.substring(markup.start, markup.end)}</a>`;
            parsedText = parsedText.substring(0, markup.start) + link + parsedText.substring(markup.end);
        } else if (markup.type === 'EM') {
            const emphasis = `<em>${parsedText.substring(markup.start, markup.end)}</em>`;
            parsedText = parsedText.substring(0, markup.start) + emphasis + parsedText.substring(markup.end);
        }
        // 可以根据其他标记类型扩展

    });

    return parsedText;
}

const articleJson = {
    paragraphs: [
        {
            "id": "6e7078d12d3a_0",
            "name": "674d",
            "type": "H3",
            "href": null,
            "layout": null,
            "metadata": null,
            "text": "the double-edged sword of efficiency",
            "hasDropCap": null,
            "dropCapImage": null,
            "markups": [],
            "__typename": "Paragraph",
            "codeBlockMetadata": null,
            "iframe": null,
            "mixtapeMetadata": null
        },
        {
            "id": "6e7078d12d3a_1",
            "name": "2b05",
            "type": "P",
            "href": null,
            "layout": null,
            "metadata": null,
            "text": "The big software defect story of the past couple of days is definitely Vassar’s accidental sending of acceptance notifications to several students. It’s a great example of one of the consequences of putting an algorithm (and indirectly, a programmer), in charge of disseminating information. On the one hand, I’m sure this saved Vassar a lot time and perhaps a job or two, completely eliminating their need for post and paper. On the other hand, they’ve adopted a system that is going to fail from time to time, and not in graceful ways that paper does, but in big, dramatic, and unpredictable ways.",
            "hasDropCap": null,
            "dropCapImage": null,
            "markups": [
                {
                    "type": "A",
                    "start": 71,
                    "end": 146,
                    "href": "http://www.pcmag.com/article2/0,2817,2399524,00.asp",
                    "anchorType": "LINK",
                    "userId": null,
                    "linkMetadata": null,
                    "__typename": "Markup"
                }
            ],
            "__typename": "Paragraph",
            "codeBlockMetadata": null,
            "iframe": null,
            "mixtapeMetadata": null
        },
        {
            "id": "6e7078d12d3a_2",
            "name": "6263",
            "type": "P",
            "href": null,
            "layout": null,
            "metadata": null,
            "text": "The unpredictability of software defects is one of the most interesting properties of software as a medium. It’s inherent complexity means that even the people who develop it are going to have a hard time knowing what part of the system will fail and how dramatically. In fact, if the developer follows best practices by modularizing the system and enabling it to scale gracefully, it will actually guarantee that the failures will be more dramatic: whether it’s a list of 1, 100, or 1,000,000, I’m sure the Vassar notification system algorithm will do the exact same thing.",
            "hasDropCap": null,
            "dropCapImage": null,
            "markups": [
                {
                    "type": "EM",
                    "start": 364,
                    "end": 370,
                    "href": null,
                    "anchorType": null,
                    "userId": null,
                    "linkMetadata": null,
                    "__typename": "Markup"
                }
            ],
            "__typename": "Paragraph",
            "codeBlockMetadata": null,
            "iframe": null,
            "mixtapeMetadata": null
        },
        {
            "id": "6e7078d12d3a_3",
            "name": "a8b0",
            "type": "P",
            "href": null,
            "layout": null,
            "metadata": null,
            "text": "I wonder how software might be built to better account for the significance of the information it transmits and computes. At the moment, I suppose this is captured in the software tests that teams perform. Perhaps a better way might be to tag the data that moves through software systems and propagate things like the confidence, credibility, and integrity of data as algorithms munge and manipulate it.",
            "hasDropCap": null,
            "dropCapImage": null,
            "markups": [
                {
                    "type": "EM",
                    "start": 63,
                    "end": 76,
                    "href": null,
                    "anchorType": null,
                    "userId": null,
                    "linkMetadata": null,
                    "__typename": "Markup"
                }
            ],
            "__typename": "Paragraph",
            "codeBlockMetadata": null,
            "iframe": null,
            "mixtapeMetadata": null
        }
    ]
};

// const articleHtml = jsonToHtml(articleJson.paragraphs);

// console.log(articleHtml);
