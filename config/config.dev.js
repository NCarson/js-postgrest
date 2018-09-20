
var Config = {
    log : mylog,
    warn: function() { console.warn.apply(console, arguments) },
    blacklist : [],
}

function mylog(msg) {
    var ok = true
    for (var i = 0; i < Config.blacklist.length; i++) {
        if (msg.toLowerCase().startsWith(Config.blacklist[i].toLowerCase())) {
            ok = false
            break
        }
	}
    if (ok) {
        console.log.apply(console, arguments);
    }
}


export default Config
