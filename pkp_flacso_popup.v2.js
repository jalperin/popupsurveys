function pkp_flacso_popup(options) {
	// allow jQuery object to be passed in
	// in case a different version of jQuery is needed from the one globally defined
	$ = options.jQuery || $;

	var POPUP_ABSOLUTE_FILE_PATH = options.popup_absolute_path;
	var language = options.language || 'es';

	var PROBABILITY_SHOWING = 1, // 1/1,000
		DELAY_BEFORE_SHOWING = 10,
		NUM_QUESTIONS_AVAILABLE = 4;

    var formID, userIP;

    var q_number, q_text, q_inputs; // The inputs for the actual poll question
    var q_IP, q_URL, q_visitorID, q_email; // input ID's for user's IP, Location, and VisitID

	// get CSS
	$("head").append('<link rel="stylesheet" href="' + POPUP_ABSOLUTE_FILE_PATH + '/alertify.css" />');

    var email_question, email_disclaimer, survey_info, formID, demographic_survey_link = '';
    switch (language) {
        case 'es':
            email_question = '�Le interesar�a ayudarnos m�s en nuestra investigaci�n? <br /> �Cual es su correo?';
            email_disclaimer = 'Su correo no ser� compartido con nadie. Solo ser� utilizado para contactarle para solicitar m�s informaci�n y compartir los resultados de este <a href="http://flacso.org.br/oa/?lang=es" target="_blank">projecto de investigaci�n</a> entre FLACSO, PKP, RedALyC, SciELO, y Latindex.';
            survey_info = 'Esta encuesta es parte de un <a href="http://flacso.org.br/oa/?lang=es" target="_blank">projecto de investigaci�n</a> entre FLACSO, PKP, RedALyC, SciELO, y Latindex.';
			demographic_survey_link = 'https://docs.google.com/a/alperin.ca/forms/d/148XDDKAwF7QPvikyFAYluoLK9QkZRn4LjmC-uk2aOHI/viewform';
            formID = '14mS6x4sYFKsJCAj5UtxNtCeqwwAV_3Vs30BvQ0SqZlQ';
			ok_button_text = 'Contestar!';
			help_button_text = 'Quiero ayudar!';
			cancel_button_text = 'Cerrar';
            break;
        case 'en':
            email_question = 'Would you be interested in helping us further? <br /> What is your email address?';
            email_disclaimer = 'Your email will not be shared with anyone. It will only be used to contact you for further information and to share the results of this <a href="http://flacso.org.br/oa/?lang=en" target="_blank">research project</a> between FLACSO, PKP, RedALyC, SciELO, and Latindex.';
            survey_info = 'This survey is part of a <a href="http://flacso.org.br/oa/?lang=en" target="_blank">research project</a> coordinated by FLACSO, PKP, RedALyC, SciELO, and Latindex.';
			demographic_survey_link = 'https://docs.google.com/a/alperin.ca/forms/d/1zuaHTfp4FCL4Js1bbt_MLwb0Xj3DoL79vC0hXKtkWCw/viewform';
            formID = '1fX1rBvduf_8K-ys8jJmFgvzZVTQA_Qggg6qBfuNBGfI';
			ok_button_text = 'Respond!';
			help_button_text = 'I want to help!';
			cancel_button_text = 'Close';
            break;
        case 'pt':
            email_question = 'Voc� estaria interessado em nos ajudar ainda mais? Qual � o seu email?';
            email_disclaimer = 'O seu email n�o ser� compartilhado com ningu�m. Ele s� vai ser usado para obter mais informa��es e para compartilhar os resultados deste <a href="http://flacso.org.br/oa/?lang=pt" target="_blank">projeto de pesquisa entre FLACSO, PKP, RedALyC, SciELO e Latindex.';
            survey_info = 'Esta pesquisa � parte de um <a href = "http://flacso.org.br/oa/?lang=pt" target = "_blank">projeto de pesquisa</a> entre FLACSO, PKP, RedALyC, SciELO e Latindex.';
			demographic_survey_link = 'https://docs.google.com/a/alperin.ca/forms/d/1UrppcqmMF2sJaYHGZjQyCoPZheHqcJEkzJWAXbONKLg/viewform';
            formID = '12E9ilg91CskPT0j7ZP2S_Y0asTEEoF37T61VsLH3X10';
			ok_button_text = 'Responder!';
			help_button_text = 'Quero ajudar!';
			cancel_button_text = 'Fechar';
            break;
    }

	function pick_question() {
		var n = 9999;
		while (true) {
			n = Math.floor(Math.random() * 10);
			if (n <= NUM_QUESTIONS_AVAILABLE) break;
		}
		return n;
	}

    // Check if the cookie exists, courtesy of
    // http://stackoverflow.com/questions/5639346/shortest-function-for-reading-a-cookie-in-javascript
    function cookie_exists(cookie_name) {
		return (r=RegExp('(^|; )' + cookie_name + '=([^;]*)').exec(document.cookie))?r[2]:false;
	}

	// load alertify.js and then execute the poll
	$.getScript(POPUP_ABSOLUTE_FILE_PATH + '/alertify.min.js', function() {
        q_number = pick_question();
        q_text, q_inputs;

       // Fetch the questions from the static HTML file
       $.get(POPUP_ABSOLUTE_FILE_PATH + 'questions_' + language + '.html', function(html) {
           if (q_number == 0) {
               switch (language) {
                   case 'es':
                       q_text = 'Nos apoyar�as contestando una breve encuesta (<2 minutos)?';
                       break;
                   case 'en':
                       q_text = 'Would you help us by answering a brief survey (<2 minutes)?';
                       break;
                   case 'pt':
                       q_text = 'Pode nos ajudar, respondendo a uma breve pesquisa (<2 minutos)';
                       break;
               }
               q_inputs = '';
           } else {
                // Get the questions from the form
                var $questions = $(html).find('.ss-form-entry');
                // and pull out the question of interest
                var $question = $($questions[q_number - 1]);

                // Get the question itself
                q_text = $question.find('ul').attr('aria-label');

                // And get the options associated with the question
                var $inputs = $question.find('li');
                $inputs.find('*').removeAttr('class');

               q_inputs = '<ul>';
               q_inputs += $.makeArray($inputs).map(function(v, i) {
                    return v.outerHTML;
                }).join('');
               q_inputs += '</ul>';

               // The last 4 questions in the form have special meaning
               q_IP = $($questions[$questions.length-2]).find('input').attr('name');
               q_visitorID = $($questions[$questions.length-3]).find('input').attr('name');
               q_URL = $($questions[$questions.length-4]).find('input').attr('name');
               q_email = $($questions[$questions.length-5]).find('input').attr('name');
           }

           // now that we have the questions, load the rest of the poll
		   if (options.get_ip_path) {
			   $.get(options.get_ip_path, {}, function(ip) {
				   userIP = ip;
				   loadPoll()
			   })
		   } else {
				userIP = $('#userIP').text();
            	loadPoll();
			}
        });
	});

	function reset() {
		alertify.set({
			labels: {
				ok: ok_button_text,
				cancel: cancel_button_text
			},
			delay: 5000,
			buttonReverse: false,
			buttonFocus: "ok"
		});
	}

	function loadPoll() {
		var formUrl = 'https://docs.google.com/a/alperin.ca/forms/d/' + formID + '/formResponse',
			pollIDprefix = 'flacso_IDRC_v2',
			pollID = pollIDprefix + '_q' + q_number,
            visitorID;

        if (!(visitorID = cookie_exists(pollIDprefix + '_visitorID'))) {
            visitorID = Math.random().toString(36).slice(2); // random alphanumeric string;;
            document.cookie = pollIDprefix + '_visitorID' + '=' + visitorID;
        }

        // set the cookie so this user does not get polled again
        document.cookie = pollIDprefix + '=1';

		if ((!cookie_exists(pollID) && Math.floor(Math.random() * PROBABILITY_SHOWING) == 0)) {
			// set the cookie specific to this question
			document.cookie = pollID + '=1';

			setTimeout(function() {
				reset();
				alertify.confirm("", function(e) {
					if (e) {
						// override if the q_number is 0, as q0 is a redirect to a form
						if (q_number == 0) {
							window.open(demographic_survey_link, '_blank');
							alertify.success("Gracias!");
						} else {
							$.ajax({
								type: "POST",
								url: formUrl,
								data: $("#flacso_idrc_poll_form").serialize()
							});

							alertify.set({
								labels: {
									ok: help_button_text,
									cancel: cancel_button_text
								}
							});

							alertify.prompt(email_question, function(e, str) {
								if (str) {
                                    post_data = {};
                                    post_data[q_email] = str;
                                    post_data[q_visitorID] = visitorID;
                                    post_data[q_URL] = window.location.href;
                                    post_data[q_IP] = userIP;

                                    $.ajax({
										type: "POST",
										url: formUrl,
										data: post_data
									})
								}
								alertify.success("Gracias!");
							});

							$('.alertify-inner').after('<div class="pkp-survey-info">' + email_disclaimer + '</div>');
						}
					} else {
                        post_data = {};
                        post_data[q_visitorID] = visitorID;
                        post_data[q_URL] = window.location.href;
                        post_data[q_IP] = userIP;

                        $.ajax({
                            type: "POST",
                            url: formUrl,
                            data: post_data
                        })
					}
				});
				var formHTML = '<form id="flacso_idrc_poll_form" name="flacso_idrc_poll_form">';
				formHTML += q_inputs;

				// we have a question that is for the URL of the page being viewed
           		formHTML += '<input type="hidden" name="' + q_URL + '" value="' + window.location.href + '"/>';

				formHTML += '<input type="hidden" name="' + q_visitorID + '" value="' + visitorID + '"/>';
				formHTML += '<input type="hidden" name="' + q_IP + '" value="' + userIP + '"/>';
                formHTML += '</form>';

				$('.alertify-message').text(q_text)

				$('.alertify-message').after(formHTML);


				$('.alertify-inner').after('<div class="pkp-survey-info">' + survey_info + '</div>');
			}, DELAY_BEFORE_SHOWING);
		}
	}
}

