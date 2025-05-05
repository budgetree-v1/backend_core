const cron = require("node-cron");
const { pennyDropStatus } = require("../cashfree");
const db = require("../../Models");

cron.schedule("*/30 * * * * *", async () => {
  try {
    console.log("**** Fetch pennydrop status****");
    let ckTxn = await db.Transaction.find({ status: 2, txnType: 3 });
    for (let txn of ckTxn) {
      let ck = await pennyDropStatus({ ref: txn.txnId });
      if (ck.success) {
        await db.Transaction.updateOne({ _id: txn._id }, { status: 3, beneName: ck.data.name_at_bank || "", beneBank: ck.data.bank_name || "" });
      }
    }
  } catch (err) {
    console.log(err);
  }
});
