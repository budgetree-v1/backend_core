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

cron.schedule("*/30 * * * * *", async () => {
  try {
    console.log("**** Update beneficiay from pennydrop****");
    let ckbene = await db.Beneficiary.find({ status: 2 });
    for (let bene of ckbene) {
      let ck = await db.Transaction.findOne();
      if (ck.status == 1) {
        await db.Beneficiary.updateOne({ status: 1 });
      } else if (ck.status == 3) {
        await db.Beneficiary.updateOne({ status: 3 });
      } else {
      }
    }
  } catch (err) {
    console.log(err);
  }
});
