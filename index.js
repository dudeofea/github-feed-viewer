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
			//add stats & diffs
			for (var i = 0; i < commits.length; i++) {
				commits[i]['stats'] = data[i*3]['stats'];
				commits[i]['files'] = data[i*3]['files'];
			};
			$('#commits > div').each(function(i){
				if(typeof commits[i] != "undefined"){
					var sel = $("#commits > div:nth-child("+(i+1)+")");
					print_commit(sel, commits[i]);
				}
			});
			cur_commits = commits;
			show_diff(3);
		});
	});
});

//show a diff patch in the detail window
function show_diff(i){
	var sel = $('#diff-view pre code');
	var html = cur_commits[i]['files'][0]['patch'];
	//replace < and > with &lt; and &gt;
	html = html.replace(/</g, '&lt;');
	html = html.replace(/>/g, '&gt;');
	sel.html(html);
	sel.each(function(i, block){
		hljs.highlightBlock(block);
		_highlight_diff(block);
	});
	//add selected class
	$("#commits > div").removeClass('selected');
	$("#commits > div:nth-child("+(i+1)+")").addClass('selected');
}

function _highlight_diff(block){
	var html = $(block).html();
	//highlight deletions / additions
	html = html.replace(/\n(-.*)/g, '\n<span class="hljs-deletion">$1</span>');
	html = html.replace(/\n(\+.*)/g, '\n<span class="hljs-addition">$1</span>');
	$(block).html(html);
}

//update commit times
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
setInterval(update_times, 1000);

//create commit in commit-wrapper element
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

//format a time difference
function print_time(now, date){
	var sec = parseInt((now.getTime() - date.getTime()) / 1000);
	if(sec < 60)		//show seconds
		return sec + "s";
	var min = parseInt(sec/60);
	if(min < 60)	//show minutes
		return parseInt(min)+"m "+parseInt(sec%60)+"s";
	var hr = parseInt(min/60);
	if(hr < 24) //show hours
		return parseInt(hr)+"h "+parseInt(min%60)+"m";
	//show days
	return parseInt(hr/24)+"d "+parseInt(hr%24)+"h";
}