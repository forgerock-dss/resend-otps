/*
THIS NODE IS FOR SAMPLE AND TESTING PURPOSES ONLY. 
FOR CUSTOMER FACING USE CASES ENSURE OTPs ARE DELIVERED USING STANDARD CHANNELS SUCH AS EMAIL, SMS, ETC.
*/

//Node to display the OTP as text for easier testing

(function () {
  if (callbacks.isEmpty()) {
    callbacksBuilder.textOutputCallback(0, nodeState.get("oneTimePassword"));
  }    
  action.goTo('true');
})();