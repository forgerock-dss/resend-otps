// Example script to verify or resend OTP

/**
 * Script configuration
*/

// Initialise the ds-node-logger-lib library script
XLogger = require("ds-node-logger-lib").XLogger;
logger = new XLogger(this);

var config = {
    /**
     * @property {string} otpValidity - OTP validity period in minutes
     * @property {string} otpExpiredError - Error message to add to sharedSate if the OTP is expired
     * @property {string} otpNotMatchError - Error message to add to sharedSate if the OTP does not match
     * @property {string} otpNodeError - Catch all error message to add to sharedState if the node encounters an unexpected error
     */
    otpValidity: 5,
    otpExpiredError: "OTP has expired",
    otpNotMatchError: "OTP does not match",
    otpNodeError: "Node configuration error"
};

/**
 * Node outcomes
*/
var nodeOutcome = {
    SUCCESS: "OTP_Validated",
    BLANK: "OTP_Blank",
    EXPIRED: "OTP_Expired",
    INVALID: "OTP_Invalid",
    RESEND: "OTP_Resend",
    ERROR: "Error"
};

/**
 * Function to compare the timestamps between the OTP entered by the user and the OTP generation timestamp against the validity period defined by this node
 * Returns boolean true if within validity or false if not
 */
function isValid(epochSeconds) {
    logger.debug("OTP timestamp from nodeState is: " + epochSeconds);
    var now = Math.floor(Date.now() / 1000);
    logger.debug("Now timestamp is: " + now);
    var validityPeriod = config.otpValidity * 60;
    var difference = Math.abs(now - epochSeconds);
    logger.debug("Time difference is: " + difference + " seconds");
    return difference <= validityPeriod;
}

/**
 * Main function
 */

(function () {
    try {
        if (callbacks.isEmpty()) {
            callbacksBuilder.textInputCallback("Enter OTP", "Enter OTP");
            callbacksBuilder.choiceCallback('Option', ['Verify OTP', 'Re-send OTP'], 0, false);
        } else {
            var selection = callbacks.getChoiceCallbacks().get(0)[0];
            logger.debug("selection = " + selection);

            //If array value is 0 then verify OTP
            if (selection.toString() == "0") {
                
                //Check if OTP is blank  
                var userOtp = callbacks.getTextInputCallbacks().get(0);
                userOtp = userOtp.trim();
                if (userOtp.length === 0) {
                    logger.error("OTP is blank ");
                    action.goTo(nodeOutcome.BLANK);
                    return;
                }

                //Check if OTP has Expired
                var otpTimestamp = nodeState.get("oneTimePasswordTimestamp");
                result = isValid(otpTimestamp);
                logger.debug("Is OTP valid result: " + result);

                if (!result) {
                    logger.error("OTP expired.");
                    action.goTo(nodeOutcome.EXPIRED).withErrorMessage(config.otpExpiredError);
                    return;
                }

                //Check if OTP is valid
                var systemOtp = nodeState.get("oneTimePassword");

                if (userOtp !== systemOtp) {
                    logger.error("OTP validation failed. OTPs do not match.");
                    action.goTo(nodeOutcome.INVALID).withErrorMessage(config.otpNotMatchError);
                    return;
                } else {
                    action.goTo(nodeOutcome.SUCCESS);
                    return;
                }

            }

            //If array value is 1 then resend OTP
            if (selection.toString() == "1") {
                logger.error("User selected re-send OTP option.");
                action.goTo(nodeOutcome.RESEND);
                return;
            }

            //If all else fails Error
            action.goTo(nodeOutcome.ERROR).withErrorMessage(config.otpNodeError);
        }
    } catch (e) {
        logger.error("Exception " + e);
        logger.debug("Stack trace " + e.stack);
    }
})();