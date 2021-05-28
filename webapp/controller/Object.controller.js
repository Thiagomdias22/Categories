sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    'sap/m/MessageToast',
    "sap/m/MessageBox"
], function (BaseController, JSONModel, History, formatter, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("categories.controller.Object", {

        formatter: formatter,

        onPressCriar: function () {
            // pega os valores da tela

            var sId = this.getView().byId("inputId").getValue();
            var sName = this.getView().byId("inputName").getValue();

            if (!sId || !sName) {
                MessageToast.show("Campos Vazios");
                return "";
            }

            // criar um objeto com essas propriedades

            var oCreate = {};
            oCreate.ID = sId;
            oCreate.Name = sName;

            var sMsgSucesso = this.getModel("i18n").getResourceBundle().getText("msgSucessoCriar");
            var sMsgErro = this.getModel("i18n").getResourceBundle().getText("msgErroCriar");

            // Fazer a requisição

            this.getModel().create("/Categories", oCreate, {
                success: function (oData) {
                    // Mostrar mensagem de sucesso

                    MessageBox.confirm(sMsgSucesso, {
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            if (sAction === MessageBox.Action.OK) {
                                window.history.go(-1);
                            }
                        }
                    });

                }, error: function (oResponse) {
                    MessageToast.show(sMsgErro);
                }
            });

        },

        onPressExcluir: function () {
            // pegar o valor do Id
            var sId = this.getView().byId("inputId").getValue();

            var sMsgSucesso1 = this.getModel("i18n").getResourceBundle().getText("msgSucessoExcluir");
            var sMsgErro1 = this.getModel("i18n").getResourceBundle().getText("msgErroExcluir");


            this.getModel().remove("/Categories(" + sId + ")", {
                success: function (oData) {
                    MessageBox.confirm(sMsgSucesso1, {
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            if (sAction === MessageBox.Action.OK) {
                                window.history.go(-1);
                            }
                        }
                    });
                }, error: function (oResponse) {
                    MessageToast.show(sMsgErro1);
                }
            });

        },

        onPressEditar: function () {
            this.getView().byId("inputId").setEditable(false);
            this.getView().byId("inputName").setEditable(true);

            this.getView().byId("btnEditar").setVisible(false);
            this.getView().byId("btnSalvar").setVisible(true);
            this.getView().byId("btnExcluir").setVisible(false);
            this.getView().byId("btnCriar").setVisible(false);
        },

        onPressSalvar: function () {
            var sId = this.getView().byId("inputId").getValue();
            var sName = this.getView().byId("inputName").getValue();

            var sMsgSucesso2 = this.getModel("i18n").getResourceBundle().getText("msgSucessoAtualizar");
            var sMsgErro2 = this.getModel("i18n").getResourceBundle().getText("mmsgErroAtualizar");
            var oUpdate = {};
            oUpdate.ID = sId;
            oUpdate.Name = sName;

            this.getModel().update("/Categories(" + sId + ")", oUpdate, {
                success: function (oData) {
                    MessageToast.show(sMsgSucesso2);
                    window.history.go(-1);
                }, error: function (oResponse) {
                    MessageToast.show(sMsgErro2);
                }
            });
        },

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var iOriginalBusyDelay,
                oViewModel = new JSONModel({
                    busy: true,
                    delay: 0
                });

            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

            // Store original busy indicator delay, so it can be restored later on
            iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
            this.setModel(oViewModel, "objectView");
            this.getOwnerComponent().getModel().metadataLoaded().then(function () {
                // Restore original busy indicator delay for the object view
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            }
            );
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */


		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").objectId;

            if (sObjectId === "new") {
                //modo de criação

                this.getView().byId("inputId").setValue("");
                this.getView().byId("inputName").setValue("");

                this.getView().byId("inputId").setEditable(true);
                this.getView().byId("inputName").setEditable(true);

                this.getView().byId("btnEditar").setVisible(false);
                this.getView().byId("btnSalvar").setVisible(false);
                this.getView().byId("btnExcluir").setVisible(false);
                this.getView().byId("btnCriar").setVisible(true);

                this.getModel("objectView").setProperty("/busy", false);

            } else {
                //modo de exibição

                this.getView().byId("inputId").setEditable(false);
                this.getView().byId("inputName").setEditable(false);

                this.getView().byId("btnEditar").setVisible(true);
                this.getView().byId("btnSalvar").setVisible(false);
                this.getView().byId("btnExcluir").setVisible(true);
                this.getView().byId("btnCriar").setVisible(false);

                var that = this;

                this.getModel().read("/Categories(" + sObjectId + ")", {
                    success: function (oData) {
                        that.getView().byId("inputId").setValue(oData.ID);
                        that.getView().byId("inputName").setValue(oData.Name);
                    }, error: function (oResponse) {

                    }
                });


                this.getModel().metadataLoaded().then(function () {
                    var sObjectPath = this.getModel().createKey("Categories", {
                        ID: sObjectId
                    });
                    this._bindView("/" + sObjectPath);
                }.bind(this));
            }
        },

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
        _bindView: function (sObjectPath) {
            var oViewModel = this.getModel("objectView"),
                oDataModel = this.getModel();

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oDataModel.metadataLoaded().then(function () {
                            // Busy indicator on view should only be set if metadata is loaded,
                            // otherwise there may be two busy indications next to each other on the
                            // screen. This happens because route matched handler already calls '_bindView'
                            // while metadata is loaded.
                            oViewModel.setProperty("/busy", true);
                        });
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange: function () {
            var oView = this.getView(),
                oViewModel = this.getModel("objectView"),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }

            var oResourceBundle = this.getResourceBundle(),
                oObject = oView.getBindingContext().getObject(),
                sObjectId = oObject.ID,
                sObjectName = oObject.ID;

            oViewModel.setProperty("/busy", false);

            oViewModel.setProperty("/shareSendEmailSubject",
                oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
            oViewModel.setProperty("/shareSendEmailMessage",
                oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        }

    });

});