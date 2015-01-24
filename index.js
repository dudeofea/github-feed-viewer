var commit_count = 8;
var cur_commits = [];

$(window).load(function(){
	var urls = ["https://github.com/dudeofea/github-feed-viewer"];
	for (var i = 0; i < urls.length; i++) {
		urls[i] = urls[i].substring(urls[i].indexOf("github.com/")+11);
	};
	var url = "https://api.github.com/repos/"+urls[0]+"/commits";
	$.get(url, function(commits){
		var d = new Dep({ bundleArgs: true });
		for (var i = 0; i < commits.length; i++) {
			$.get(commits[i]['url'], d.addDep());
		};
		d.calc(function(data){
			//add stats
			for (var i = 0; i < commits.length; i++) {
				commits[i]['stats'] = data[i*3]['stats'];
			};
			$('#commits > div').each(function(i){
				if(typeof commits[i] != "undefined"){
					var sel = $("#commits > div:nth-child("+(i+1)+")");
					print_commit(sel, commits[i]);
				}
			});
			cur_commits = commits;
			update_times();
		});
	});
});

function update_times(){
	var now = new Date();
	$('#commits > div').each(function(i){
		if(typeof cur_commits[i] != "undefined"){
			var sel = $("#commits > div:nth-child("+(i+1)+") .time");
			var date = new Date(cur_commits[i]['commit']['author']['date']);
			sel.html(print_time(now, date));
		}
	});
}

function print_commit(sel, commit){
	var html = "";
	var insert_o = Math.min(0.4 + Math.sqrt(commit['stats']['additions'])/20, 1.0);
	var delete_o = Math.min(0.4 + Math.sqrt(commit['stats']['deletions'])/20, 1.0);
	html += '<div class="commit"> \
					<img src="'+commit['author']['avatar_url']+'"> \
					<div class="username">'+commit['author']['login']+'</div> \
					<div class="stats"> \
						<div class="insert-count" style="opacity:'+insert_o+'">'+commit['stats']['additions']+'+</div> \
						<div class="delete-count" style="opacity:'+delete_o+'">'+commit['stats']['deletions']+'-</div> \
					</div> \
					<div class="message">'+commit['commit']['message']+'</div> \
					<div class="time"></div> \
				</div>';
	sel.html(html);
}

function print_time(now, date){
	var diff = parseInt((now.getTime() - date.getTime()) / 1000);
	if(diff < 60)		//show seconds
		return diff + "s";
	if(diff < 10 * 60)	//show minutes for less than 10m
		return parseInt(diff/60)+"m "+parseInt(diff%60)+"s";
	if(diff < 60 * 60)	//show minutes
		return parseInt(diff/60)+"m";
	if(diff < 60 * 60 * 24) //show hours
		return parseInt(diff/3600)+"hrs";
	//show days
	return parseInt(diff/86400)+"d";
}