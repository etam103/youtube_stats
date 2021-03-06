<script>
        // TODO: - add the reference where I got this code
        // I need to trim strings when passing it over

        // NOTE: - might want to reference by id instead
        // NOTE: - switch this to ids
        var $messages = $('.messages'); // Messages area

        var $searchButton = $('#searchButton'); // search button
        var $searchInput = $('#searchInput'); // search input
        var $searchResults = $('.searchResults'); // search results

        var COLORS = [
            '#e21400', '#91580f', '#f8a700', '#f78b00',
            '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
            '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
        ];

          // Gets the color of a username through our hash function
        function getColor(text) {
          // Compute hash code
          var hash = 7;
          for (var i = 0; i < text.length; i++) {
              hash = text.charCodeAt(i) + (hash << 5) - hash;
          }
          // Calculate color
          var index = Math.abs(hash % COLORS.length);
          return COLORS[index];
        }

        // Adds the visual chat message to the message list
        function addChatMessage(data, options) {
          var $usernameDiv = $('<span class="username"/>')
                              .text(data.username)
                              .css('color', getColor(data.username));

          var $messageBodyDiv = $('<span class="messageBody">')
                                  .text(data.message);

          var $messageDiv = $('<li class="message"/>')
                              .data('username', data.username)
                              .append($usernameDiv, $messageBodyDiv);

          addMessageElement($messageDiv, options);
        }

        function addMessageElement(el) {
          var $el = $(el);

          $messages.append($el);
          $messages[0].scrollTop = $messages[0].scrollHeight;
        }

        function addSearchResults(data) {
          const { messages } = data;
          messages.forEach((message) => {
            var $searchMessageBodyDiv = $('<span class="searchMessageBody">')
                                        .text(message)
                                        .css('color', getColor(message));

            var $searchMessageDiv = $('<li class="searchMessage"/>')
                                  .append($searchMessageBodyDiv);

            $searchResults.append($searchMessageDiv);
          });
        }

        // NOTE: - should I use es6 ???
        // NOTE: - emit videoId
        const socket = io();
        socket.on('connect', function(data) {
          socket.emit('startPolling', {
              videoId : "<%=videoId%>"
          });
        });

        socket.on('new message', function(data) {
          addChatMessage(data);
        });

        socket.on('searchResults', function(data) {
          if (data !== null) {
            $searchResults.empty();
            addSearchResults(data);
          }
        });

        $searchButton.click(function() {
          const searchInputContents = $searchInput.val();                                
          socket.emit('search', { username: searchInputContents });
        });
      </script>  