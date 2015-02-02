Comet.open('/price', function (price) {
	$('.fiat-amount').text(CurrencyData.symbol + number_format(price,2,'.',','));
});
$(function () {
	var gt = new Gettext({domain: 'secondary'});
	function _(msgid) { return gt.gettext(msgid); }
	MBP.hideUrlBarOnLoad();
	
	$('img').on('contextmenu', function (e) {
		return false;
	});
	
	(function init() {
		var video = $('#video')[0],
			canvas = $('#qr-canvas')[0],
			height = 360,
			width = 480,
			suspended = false,
			streaming = false;
		
		function confirmAddr(addr) {
			new Messi(
				'<pre><strong class="address">' + addr + '</strong></pre> ' + _('Is this your address?'),
				{
					title: _('Address Detected:'),
					modal: true,
					center: true,
					closeButton: false,
					buttons: [
						{
							id: 0,
							label: _('Yes'),
							val: 'Y',
							class: 'btn-success'
						},
						{
							id: 1,
							label: _('No'),
							val: 'N',
							class: 'btn-danger'
						}
					],
					callback: function (val) {
						if (val === 'Y') {
							window.location.replace('/purchase/' + addr);
						} else {
							suspended = false;
						}
					}
				}
			);
		}
		
		//this does not validate the address
		function getBitcoinAddress(url) {
			//remove scheme and double slashes
			url = url.replace(/bitcoin:(\/\/)?/, '');
			//remove query
			return url.split('?')[0];
		}
		
		var capturing = false;
		function decodeResult(data) {
			capturing = false;
			if (data === 'error decoding QR Code') {
				return;
			}
			var l = data.length;
			var addr = '';
			if (/bitcoin:/.test(data) || (l >= 27 && l <= 34)) {
				suspended = true;
				addr = getBitcoinAddress(data);
				$.getJSON('/validate/' + addr)
					.done(function (result) {
						if (result.valid) {
							confirmAddr(addr);
						}
					})
					.always(function () {
						suspend = false;
					});
			}
		}
		
		qrcode.callback = decodeResult;
		
		function getMedia(constraints, success, error) {
			(
				navigator.getUserMedia ||
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia ||
				navigator.msGetUserMedia
			).call(navigator, constraints, success, error);
		}
		
		getMedia(
			{video:true, audio:false},
			function success(stream) {
				if (navigator.mozGetUserMedia) {
					video.mozSrcObject = stream;
				} else {
					video.src = (window.URL || window.webkitURL).createObjectURL(stream);
				}
				video.play();
			},
			function error(err) {
			}
		);
		
		$(video).on('loadeddata', function () {
			if (!streaming) {
				streaming = true;
			}
		});
		
		$(video).hide();
		$(video).on('timeupdate', function () {
			if (video.videoWidth || video.videoHeight) {
				width = video.videoWidth * 0.75;
				height = video.videoHeight * 0.75;
				$(canvas)
					.attr('width', width)
					.attr('height', height);
				$(video).off('timeupdate');
			}
		});
		
		var ctx = canvas.getContext('2d');
		
		function capture() {
			if (capturing || suspended) {
				return;
			}
			try {
				ctx.drawImage(video, 0, 0, width, height, 0, 0, width, height);
				capturing = true;
				qrcode.decode();
			} catch (e) {
				capturing = false;
			}
		}
		
		var requestAnimationFrame = (function rafMemo() {
			var raf = window.requestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				function raf(cb) {
					window.setTimeout(cb, 10);
				};
			return raf;
		}());
		
		(function anim() {
			if (!suspended && Network.isConnected()) {
				capture();
			}
			requestAnimationFrame(anim);
		}());
	}());
});
function number_format(number, decimals, dec_point, thousands_sep) {
  //  discuss at: http://phpjs.org/functions/number_format/
  // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: davook
  // improved by: Brett Zamir (http://brett-zamir.me)
  // improved by: Brett Zamir (http://brett-zamir.me)
  // improved by: Theriault
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Michael White (http://getsprink.com)
  // bugfixed by: Benjamin Lupton
  // bugfixed by: Allan Jensen (http://www.winternet.no)
  // bugfixed by: Howard Yeend
  // bugfixed by: Diogo Resende
  // bugfixed by: Rival
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  //  revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  //  revised by: Luke Smith (http://lucassmith.name)
  //    input by: Kheang Hok Chin (http://www.distantia.ca/)
  //    input by: Jay Klehr
  //    input by: Amir Habibi (http://www.residence-mixte.com/)
  //    input by: Amirouche
  //   example 1: number_format(1234.56);
  //   returns 1: '1,235'
  //   example 2: number_format(1234.56, 2, ',', ' ');
  //   returns 2: '1 234,56'
  //   example 3: number_format(1234.5678, 2, '.', '');
  //   returns 3: '1234.57'
  //   example 4: number_format(67, 2, ',', '.');
  //   returns 4: '67,00'
  //   example 5: number_format(1000);
  //   returns 5: '1,000'
  //   example 6: number_format(67.311, 2);
  //   returns 6: '67.31'
  //   example 7: number_format(1000.55, 1);
  //   returns 7: '1,000.6'
  //   example 8: number_format(67000, 5, ',', '.');
  //   returns 8: '67.000,00000'
  //   example 9: number_format(0.9, 0);
  //   returns 9: '1'
  //  example 10: number_format('1.20', 2);
  //  returns 10: '1.20'
  //  example 11: number_format('1.20', 4);
  //  returns 11: '1.2000'
  //  example 12: number_format('1.2000', 3);
  //  returns 12: '1.200'
  //  example 13: number_format('1 000,50', 2, '.', ' ');
  //  returns 13: '100 050.00'
  //  example 14: number_format(1e-8, 8, '.', '');
  //  returns 14: '0.00000001'

  number = (number + '')
    .replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
    .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  return s.join(dec);
}
