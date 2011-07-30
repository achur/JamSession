	    <![CDATA[
	    	<% for (key in this.keys) {%>
				<tr class="piano-roll-row">
					<td class="piano-roll-row-key">
						<img src = '<%= "img/key" + this.keys[key] + ".png" %>'>
					</td>
					<td class="piano-roll-row-roll">
					</td>
				</tr>
			<% } %>
			<div class="piano-roll-play-cursor"></div>
	    ]]>
