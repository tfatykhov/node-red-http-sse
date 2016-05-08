
module.exports = function(RED) {
	"use strict";
	var EventSource = require('eventsource')

	function SSENode(config) {
		var node = this

		RED.nodes.createNode(node, config);
		this.on('input', msg => {
			this.status({fill: 'yellow', shape: 'dot', text: 'Requesting'});
            this.remote = msg.remote
            this.events = (msg.events || "message").split(/,/)

            this.status({fill: 'red', shape: 'ring', text: 'common.status.disconnected'})

            if (this.remote) {
                this.client = new EventSource(this.remote)

                this.client.onopen = function() {
                    node.status({fill: "green", shape: "dot", text: "common.status.connected"})
                }

                for (var i in this.events)
                    this.client.addEventListener(this.events[i], function(e) {
                        node.send({
                            event: e.type,
                            payload: e.data
                        })
                    })

                this.client.onerror = function(err) {
                    node.status({fill: "red", shape: "dot", text: "common.status.error"});
                }
            }

            this.on("close", function() {
                node.status({fill: "red", shape: "ring", text: "common.status.disconnected"});
                if (this.client)
                    this.client.close()
            });
    	});    
	}

	RED.nodes.registerType("http-sse", SSENode);
}
