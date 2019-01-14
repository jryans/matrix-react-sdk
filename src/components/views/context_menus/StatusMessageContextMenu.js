/*
Copyright 2018 New Vector Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { _t } from '../../../languageHandler';
import MatrixClientPeg from '../../../MatrixClientPeg';
import AccessibleButton from '../elements/AccessibleButton';

export default class StatusMessageContextMenu extends React.Component {
    static propTypes = {
        // js-sdk User object. Not required because it might not exist.
        user: PropTypes.object,
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            message: this.comittedStatusMessage,
        };
    }

    componentWillMount() {
        const { user } = this.props;
        if (!user) {
            return;
        }
        user.on("User._unstable_statusMessage", this._onStatusMessageCommitted);
    }

    componentWillUmount() {
        const { user } = this.props;
        if (!user) {
            return;
        }
        user.removeListener(
            "User._unstable_statusMessage",
            this._onStatusMessageCommitted,
        );
    }

    get comittedStatusMessage() {
        return this.props.user ? this.props.user._unstable_statusMessage : "";
    }

    _onStatusMessageCommitted = () => {
        // The `User` object has observed a status message change.
        this.setState({
            message: this.comittedStatusMessage,
        });
    };

    _onClearClick = async (e) => {
        await MatrixClientPeg.get()._unstable_setStatusMessage("");
    };

    _onSubmit = (e) => {
        e.preventDefault();
        MatrixClientPeg.get()._unstable_setStatusMessage(this.state.message);
    };

    _onStatusChange = (e) => {
        // The input field's value was changed.
        this.setState({
            message: e.target.value,
        });
    };

    render() {
        let actionButton;
        if (this.comittedStatusMessage) {
            if (this.state.message === this.comittedStatusMessage) {
                actionButton = <AccessibleButton className="mx_StatusMessageContextMenu_clear"
                    onClick={this._onClearClick}
                >
                    <span>{_t("Clear status")}</span>
                </AccessibleButton>;
            } else {
                actionButton = <AccessibleButton className="mx_StatusMessageContextMenu_submit"
                    onClick={this._onSubmit}
                >
                    <span>{_t("Update status")}</span>
                </AccessibleButton>;
            }
        } else {
            actionButton = <AccessibleButton className="mx_StatusMessageContextMenu_submit"
                disabled={!this.state.message} onClick={this._onSubmit}
            >
                <span>{_t("Set status")}</span>
            </AccessibleButton>;
        }

        const form = <form className="mx_StatusMessageContextMenu_form"
            autoComplete="off" onSubmit={this._onSubmit}
        >
            <input type="text" className="mx_StatusMessageContextMenu_message"
                key="message" placeholder={_t("Set a new status...")}
                autoFocus={true} maxLength="60" value={this.state.message}
                onChange={this._onStatusChange}
            />
            {actionButton}
        </form>;

        return <div className="mx_StatusMessageContextMenu">
            { form }
        </div>;
    }
}
