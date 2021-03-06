App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,
    init: function () {
        console.log("App initialized...")
        return App.initWeb3();
    },
    initWeb3: function () {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = ethereum;
            web3 = new Web3(ethereum);
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContracts();
    },
    initContracts: function () {
        $.getJSON("RPTokenSale.json", function (RPTokenSale) {
            App.contracts.RPTokenSale = TruffleContract(RPTokenSale);
            App.contracts.RPTokenSale.setProvider(App.web3Provider);
            App.contracts.RPTokenSale.deployed().then(function (RPTokenSale) {
                console.log("RP Token Sale Address:", RPTokenSale.address);
            });
        }).done(function () {
            $.getJSON("RPToken.json", function (RPToken) {
                App.contracts.RPToken = TruffleContract(RPToken);
                App.contracts.RPToken.setProvider(App.web3Provider);
                App.contracts.RPToken.deployed().then(function (RPToken) {
                    console.log("RP Token Address:", RPToken.address);
                });
                App.listenForEvents();
                return App.render();
            });
        })
    },
    render: function () {
        if (App.loading) {
            return;
        }
        var loader = $('#loader');
        var content = $('#content');

        // loader.show();
        // loader.hide();

        ethereum.request({ method: 'eth_requestAccounts' }).then(function (acc) {
            App.account = acc[0];
            $("#accountAddress").html("Your Account: " + App.account);
            App.loading = false;
            loader.hide();
            content.show();
        });

        // Load token sale contract
        App.contracts.RPTokenSale.deployed().then(function (instance) {
            RPTokenSaleInstance = instance;
            return RPTokenSaleInstance.tokenPrice();
        }).then(function (tokenPrice) {
            App.tokenPrice = tokenPrice;
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
            return RPTokenSaleInstance.tokensSold();
        }).then(function (tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokensAvailable);

            var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
            $('#progress').css('width', progressPercent + '%');

            App.contracts.RPToken.deployed().then(function (instance) {
                RPTokenInstance = instance;
                return RPTokenInstance.balanceOf(App.account);
            }).then(function (balance) {
                $('.RP-balance').html(balance.toNumber());
                App.loading = false;
                loader.hide();
                content.show();
            })
        });

    },

    listenForEvents: function () {
        App.contracts.RPTokenSale.deployed().then(function (instance) {
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest',
            }).watch(function (error, event) {
                console.log("event triggered", event);
                App.render();
            })
        })
    },
    buyTokens: function () {
        $('#content').hide();
        $('#loader').show();
        var numberOfTokens = $('#numberOfTokens').val();
        App.contracts.RPTokenSale.deployed().then(function (instance) {
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: numberOfTokens * App.tokenPrice,
                gas: 500000 // Gas limit
            });
        }).then(function (result) {
            console.log("Tokens bought...")
            $('form').trigger('reset') // reset number of tokens in form
            // Wait for Sell event
        });
    }
}

$(function () {
    $(window).load(function () {
        App.init();
    })
});