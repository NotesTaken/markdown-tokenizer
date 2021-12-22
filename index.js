class Token {
    name = "";
    prefix = "";
    rawText = "";
    text = "";

    constructor(name = "", prefix = "", rawText = "", text = "") {
        this.name = name;
        this.prefix = prefix;
        this.rawText = rawText;
        this.text = text;
    }
}

class Tokenizer {

    types = {};
    binds = {};
    listener = null;

    constructor() {
    }

    //Register types
    registerType(prefix, name, callback) {
        if (this.types[name]) return callback(new Error("Type already exists"));
        this.types[name] = {prefix, name, callback};

        callback();
    }

    //Bind callbacks for registered types
    bind(name, callback) {
        this.binds[name] = {name, callback};
    }

    //Listen to events happening outside of bound actions (empty new line, unrecognized text)
    listen(callback) {
        this.listener = callback;
    }

    parse(input) {
        let matchType = (testInput) => {

            let tempType = "";

            let i;
            for (i = 0; i < testInput.length && testInput[i] !== " "; i++) {
                tempType += testInput[i];
            }

            let text = testInput.substring(i + 1);

            let result = {
                prefix: tempType,
                text: text,
                bind: null
            };

            Object.keys(this.types).forEach((key, index) => {
                if (tempType === this.types[key].prefix) {
                    return result.bind = this.binds[key];
                }
            });

            if (result.bind)
                return result;
            else
                return null;
        };

        let temp = "";
        let currentChar = input[0];

        for (let i = 0; i < input.length; i++, currentChar = input[i]) {

            if (currentChar === "\n" || i === input.length-1) {

                if(i === input.length-1)
                {
                    temp  += input[i];
                }

                if (temp === "") {
                    //Solve for empty line
                    this.listener(new Token("empty-line"));
                    continue;
                }

                let match = matchType(temp);

                if (match) {
                    let token = new Token(match.bind.name, match.prefix, temp, match.text);

                    match.bind.callback(token);
                } else {
                    this.listener(new Token("text", "", temp, temp));
                }

                temp = "";
                continue;
            }

            temp += currentChar;
        }
    }
}

const token = new Tokenizer();

token.registerType("#", "heading-1", (err) => {
    if (err) return console.log(err);

    token.bind("heading-1", (result) => {
        console.log("Found heading", result);
    });

    console.log("Successfully registered type");
});

token.registerType("##", "heading-2", (err) => {
    if (err) return console.log(err);

    token.bind("heading-2", (result) => {
        console.log("Found heading", result);
    });

    console.log("Successfully registered type");
});

token.registerType("-", "unordered-list-item", (err) => {
    if (err) return console.log(err);

    token.bind("unordered-list-item", (result) => {
        console.log("Found list item", result);
    });

    console.log("Successfully registered type");
});

token.listen((action) => {
    console.log("Action", action);
});

token.parse("# Hello World\n\n## Hello\n\n- list\nParagraph");
