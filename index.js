var cur_commits = [];

$(window).load(function(){
	var url = "https://api.github.com/repos/dudeofea/Anonument/commits";
	$.get(url, function(commits){
		var d = new Dep({ bundleArgs: true });
		for (var i = 0; i < commits.length; i++) {
			$.get(commits[i]['url'], d.addDep());
		};
		d.calc(function(data){
			for (var i = 0; i < commits.length; i++) {
				commits[i]['stats'] = data[i*3]['stats'];
			};
			$('#commits > div').each(function(i){
				if(typeof commits[i] != "undefined"){
					var sel = $("#commits > div:nth-child("+i+")");
					print_commit(sel, commits[i]);
				}
			});
		});
	});
});

function print_commit(sel, commit){
	var html = "";
	html += '<div class="commit"> \
					<img src="'+commit['author']['avatar_url']+'"> \
					<div class="username">'+commit['author']['login']+'</div> \
					<div> \
						<div class="insert-count">+ '+commit['stats']['additions']+'</div> \
						<div class="delete-count">- '+commit['stats']['deletions']+'</div> \
					</div> \
					<div class="message">'+commit['commit']['message']+'</div> \
					<div class="time">30s</div> \
				</div>';
	sel.html(html);
}

function print_time(date){
	
}