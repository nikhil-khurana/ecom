
import * as mocha from 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as AWS from 'aws-sdk';
import * as Consumer from 'sqs-consumer';
import { ERPIntegration } from './../src/integrations/ERPintegration';
import { AWS_SQS_Helper } from './../src/lib/aws_sqs_helper';
import { SqsWrapper } from './../src/helpers/erp_sqs_wrapper';
import * as  testData  from './fixtures/erp_data';
import * as erpConfig from './fixtures/erp_config_data'
const expect = chai.expect;
const should = chai.should();
const Obj:any = erpConfig.erpConfigData;

describe('ERPIntegration Testing : pushUser',() =>{

    it('should call Send Message method ', () => {
        let data:any = testData.erpData[0];
        let erp = new ERPIntegration(Obj);
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.pushUser(data);
        let called_status = stub.calledOnce;
        expect(called_status).to.equal(true);
        stub.reset();
    });
    it('Send Message should be called with exactly 2 arguments(base64 encoded message Body and Headers Object)', () => {
        let data:any = testData.erpData[0];
        let erp = new ERPIntegration(Obj);
        let modJSON = new Buffer(JSON.stringify(data)).toString("base64")
        const now = new Date()
        let headerObj = {
            'action': "new_user",
            'brand_id': Obj.brand_data.id,
            'performed_at': now
        }
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.pushUser(data,now);
        let args_status = stub.calledWithExactly(modJSON,headerObj)
        expect(args_status).to.equal(true);
        stub.reset();
    });

})
describe('ERPIntegration Testing : pushProduct',() =>{
    it('should call Send Message method ', () => {
        let data = testData.erpData[1];
        let erp = new ERPIntegration(Obj);
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.pushProduct(data);
        let called_status = stub.calledOnce;
        expect(called_status).to.equal(true);
        stub.reset();
    });
    it('Send Message should be called with exactly 2 arguments (base64 encoded message Body and Headers Object)', () => {
        let data:any = testData.erpData[1];
        let measurements = data.measurements;
        let erp = new ERPIntegration(Obj);
        const now = new Date()
        let modJSON = {
            'id':  data.product_id ,
            'name': data.name ,
            'style':data.style ,
            'color':data.color ,
            'optical_sun':data.sunwear ,
            'gender':data.product_gender ,
            'lens_type':data.sunwear ,
            'product_category':data.product_category ,
            'lens_width':measurements.lens_width ,
            'bridge':measurements.bridge ,
            'temple':measurements.temple
        }
        let headerObj = {
            'action': "new_product",
            'brand_id': Obj.brand_data.id,
            'performed_at': now
        }
        let message = new Buffer(JSON.stringify(modJSON)).toString("base64");
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.pushProduct(data,now);
        let args_status = stub.calledWithExactly(message,headerObj)
        expect(args_status).to.equal(true);
        stub.reset();
    });

})
describe('ERPIntegration Testing : pushSendToLab',() =>{
    it('should call Send Message method ', () => {
        let data:any = testData.erpData[2];
        data = data.eyewear;
        let erp = new ERPIntegration(Obj);
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        let orderJson = {
            'discount_type':'General',
            'customer_email':'customer@mailinator.com'
        }
        erp.pushSendToLab(1,data,orderJson);
        let called_status = stub.calledOnce;
        expect(called_status).to.equal(true);
        stub.reset();
    })
    it('Send Message should be called with exactly 2 arguments (base64 encoded message Body and Headers Object)', () => {
        let data:any = testData.erpData[2];
        data = data.eyewear;
        let now = new Date()
        let erp = new ERPIntegration(Obj)
        let orderJson = {
            'discount_type':'General',
            'customer_email':'customer@mailinator.com'
        }
        let modJSON = {
            'order_id': 1,
            'lens_items': data,
            'discount_type': orderJson.discount_type,
            'customer_email': orderJson.customer_email
        }
        let headerObj = {
            'action': "send_to_lab",
            'brand_id': Obj.brand_data.id,
            'performed_at': data[0].sent_to_lab_at
        }
        let message = new Buffer(JSON.stringify(modJSON)).toString("base64");
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.pushSendToLab(1,data,orderJson,data[0].sent_to_lab_at);
        let args_status = stub.calledWithExactly(message,headerObj)
        expect(args_status).to.equal(true);
        stub.reset();
    });

})
describe('ERPIntegration Testing : cancelItems',() =>{
    it('should call Send Message method ', () => {
        let data:any = testData.erpData[3];
        data = data.eyewear;
        const now = new Date()
        let erp = new ERPIntegration(Obj);
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        let orderJson = {
            'discount_type':'General',
        }
        erp.cancelItems(1,data,orderJson,now);
        let called_status = stub.calledOnce;
        expect(called_status).to.equal(true);
        stub.reset();
    })
    it('Send Message should be called with exactly 2 arguments (base64 encoded message Body and Headers Object)', () => {
        let data:any = testData.erpData[3];
        data = data.eyewear;
        const now = new Date()
        let erp = new ERPIntegration(Obj)
        let orderJson = {
            'discount_type':'General',
            'customer_email':'customer@mailinator.com'
        }
        let modJSON = {
            'order_id': '1',
            'line_id': data,
            'discount_type': orderJson.discount_type
        }
        let headerObj = {
            'action': "cancel_items",
            'brand_id': Obj.brand_data.id,
            'performed_at': now
        }
        let message = new Buffer(JSON.stringify(modJSON)).toString("base64");
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.cancelItems('1',data,orderJson,now);
        let args_status = stub.calledWithExactly(message,headerObj)
        expect(args_status).to.equal(true);
        stub.reset();
    });
})
describe('ERPIntegration Testing : authorizeItemReturn',() =>{
    it('should call Send Message method ', () => {
        let data:any = testData.erpData[3];
        data = data.eyewear;
        const now = new Date()
        let erp = new ERPIntegration(Obj);
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.authorizeItemReturn(1,data,'General',now);
        let called_status = stub.calledOnce;
        expect(called_status).to.equal(true);
        stub.reset();
    })
    it('Send Message should be called with exactly 2 arguments (base64 encoded message Body and Headers Object)', () => {
        let data:any = testData.erpData[3];
        data = data.eyewear;
        const now = new Date()
        let erp = new ERPIntegration(Obj)
        let modJSON = {
            'order_id': 1,
            'line_id': data,
            'discount_type': 'General'
        }
        let headerObj = {
            'action': "authorize_return",
            'brand_id': Obj.brand_data.id,
            'performed_at': now
        }
        let message = new Buffer(JSON.stringify(modJSON)).toString("base64");
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.authorizeItemReturn(1,data,'General',now);
        let args_status = stub.calledWithExactly(message,headerObj)
        expect(args_status).to.equal(true);
        stub.reset();
    });
})
describe('ERPIntegration Testing : refundOrder',() =>{
    it('should call Send Message method ', () => {
        let data:any = testData.erpData[3];
        data = data.eyewear;
        const now = new Date()
        let erp = new ERPIntegration(Obj);
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.refundOrder(1,100,now);
        let called_status = stub.calledOnce;
        expect(called_status).to.equal(true);
        stub.reset();
    })
    it('Send Message should be called with exactly 2 arguments (base64 encoded message Body and Headers Object)', () => {
        let data:any = testData.erpData[3];
        data = data.eyewear;
        const now = new Date()
        let erp = new ERPIntegration(Obj)
        let modJSON = {
            'order_id': 1,
            'credit_id': 1,
            'amount': 100
        }
        let headerObj = {
            'action': "refund_order",
            'brand_id': Obj.brand_data.id,
            'performed_at': now
        }
        let message = new Buffer(JSON.stringify(modJSON)).toString("base64");
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.refundOrder(1,100,now);
        let args_status = stub.calledWithExactly(message,headerObj)
        expect(args_status).to.equal(true);
        stub.reset();
    });
})
describe('ERPIntegration Testing : updateStoreCredit',() =>{
    it('Send Message should be called with exactly 2 arguments (base64 encoded message Body and Headers Object)', () => {
        let data:any = testData.erpData[3];
        data = data.eyewear;
        const now = new Date()
        let erp = new ERPIntegration(Obj)
        let modJSON = {
            'credit_id': 1,
            'amount': 100
        }
        let headerObj = {
            'action': "update_store_credit",
            'brand_id': Obj.brand_data.id,
            'performed_at': now
        }
        let message = new Buffer(JSON.stringify(modJSON)).toString("base64");
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.updateStoreCredit(1,100,now);
        let args_status = stub.calledWithExactly(message,headerObj)
        expect(args_status).to.equal(true);
        stub.reset();
    });
})
describe('ERPIntegration Testing : pushOrder',() =>{
    it('Send Message should be called with exactly 2 arguments (base64 encoded message Body and Headers Object)', () => {
        let data:any = testData.erpData[4];
        const now = new Date()
        let erp = new ERPIntegration(Obj)
        let modJSON = {
          "order_id": 2523,
          "customer": {
            "email": "neelesh@mailinator.com",
            "name": "SrivastavaNeelesh"
          },
          "shipping_address": {
            "id": 1,
            "city": "New York",
            "first_name": "Sunil",
            "last_name": "Kumar",
            "zip": "10002",
            "country": "US",
            "address2": null,
            "state": "NY",
            "address1": "141 W 28th St Fl 7",
            "phone": null
          },
          "ordered_at": "2017-07-24T05:06:36.000Z",
          "kiosk_id": "1",
          "order_net": 181.8,
          "discount_type": "XXX",
          "customer_charged": 181.8,
          "created_by": "Srivastava Neelesh",
          "eyewear_items": [
            {
              "product_id": "vhgftyjj",
              "variant": " ",
              "lens_type": null,
              "totals": {
                "list_price": 89,
                "initial_charge": 83,
                "item_tax": 0,
                "combined_tax_rate": 0,
                "discount": 6,
                "item_net": null
              },
              "line_id": 100,
              "on_hand": false,
              "location_id": "1"
            },
            {
              "product_id": "box_cs",
              "variant": null,
              "lens_type": null,
              "totals": {
                "list_price": 0,
                "initial_charge": 0,
                "item_tax": 0,
                "combined_tax_rate": 0,
                "discount": 0,
                "item_net": 0
              },
              "line_id": 100,
              "on_hand": false,
              "location_id": "1"
            },
            {
              "product_id": "vhgftyjj",
              "variant": " ",
              "lens_type": null,
              "totals": {
                "list_price": 89,
                "initial_charge": 83,
                "item_tax": 0,
                "combined_tax_rate": 0,
                "discount": 6,
                "item_net": null
              },
              "line_id": 200,
              "on_hand": false,
              "location_id": "1"
            },
            {
              "product_id": "box_cs",
              "variant": null,
              "lens_type": null,
              "totals": {
                "list_price": 0,
                "initial_charge": 0,
                "item_tax": 0,
                "combined_tax_rate": 0,
                "discount": 0,
                "item_net": 0
              },
              "line_id": 200,
              "on_hand": false,
              "location_id": "1"
            }
          ],
          "htk_items": [
            {
              "product_id": "vhgftyjj",
              "location_id": "htk_in",
              "line_id": 300
            }
          ]
        }
        let headerObj = {
            'action': "new_order",
            'brand_id': Obj.brand_data.id,
            'performed_at': data.ordered_at ? data.ordered_at : now
        }
        let message = new Buffer(JSON.stringify(modJSON)).toString("base64");
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.pushOrder(data,data.order_net);
        let args_status = stub.calledWithExactly(message,headerObj)
        expect(args_status).to.equal(true);
        stub.reset();
    });
})
describe('ERPIntegration Testing : shipItems',() =>{
    it('Send Message should be called with exactly 2 arguments (base64 encoded message Body and Headers Object)', () => {
        let data:any = testData.erpData[5];
        const now = new Date()
        let erp = new ERPIntegration(Obj)
        let modJSON = {
            order_id: 2728,
          items:
           [ { line_id: 35395309,
               location_id: '1',
               needs_lab_processing: false } ],
          discount_type: 'XXX',
          store_credit_used: 0
       }

        let headerObj = {
            'action': "ship_items",
            'brand_id': Obj.brand_data.id,
            'performed_at': data.items.eyewear.items[0].status.shipped_at
        }
        let message = new Buffer(JSON.stringify(modJSON)).toString("base64");
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.shipItems(data,[data.items.eyewear.items[0].id]);
        let args_status = stub.calledWithExactly(message,headerObj)
        expect(args_status).to.equal(true);
        stub.reset();
    });
})
describe('ERPIntegration Testing : shipHtk',() =>{
    it('Send Message should be called with exactly 2 arguments (base64 encoded message Body and Headers Object)', () => {
        let data:any = testData.erpData[6];
        const now = new Date()
        let erp = new ERPIntegration(Obj)
        let modJSON = {
            order_id: 2728,
            items: [
                { line_id: 90002551,
                    location_id: 'htk_in'
                }
            ],
         discount_type: 'Normal',
         store_credit_used: []
      }



        let headerObj = {
            'action': "ship_htk",
            'brand_id': Obj.brand_data.id,
            'performed_at': now
        }
        let message = new Buffer(JSON.stringify(modJSON)).toString("base64");
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.shipHtk(data,now);
        let args_status = stub.calledWithExactly(message,headerObj)
        expect(args_status).to.equal(true);
        stub.reset();
    });
})
describe('ERPIntegration Testing : recieveReturnedFrame',() =>{
    it('Send Message should be called with exactly 2 arguments (base64 encoded message Body and Headers Object)', () => {
        let data:any = testData.erpData[7];
        const now = new Date()
        let erp = new ERPIntegration(Obj)
        let modJSON = {
          order_id: 2728,
          items:
           [ { product_id: 'vhgftyjj',
               line_id: 35395309,
               is_restock: true,
               location_id: 'warehouse',
               lens_id: null,
               package_id: 'box_cs' } ],
          discount_type: 'XXX'
      }
       let headerObj = {
            'action': "receive_frame",
            'brand_id': Obj.brand_data.id,
            'performed_at': data.items.eyewear.items[0].status.return_received_at
        }
        let message = new Buffer(JSON.stringify(modJSON)).toString("base64");
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.recieveReturnedFrame(data,[data.items.eyewear.items[0].id]);
        let args_status = stub.calledWithExactly(message,headerObj)
        expect(args_status).to.equal(true);
        stub.reset();
    });
})
describe('ERPIntegration Testing : refundItems',() =>{
    it('Send Message should be called with exactly 2 arguments (base64 encoded message Body and Headers Object)', () => {
        let data:any = testData.erpData[8];
        const now = new Date()
        let erp = new ERPIntegration(Obj)
        let modJSON = { order_id: 1,
          customer_email: 'neelesh@mailinator.com',
          items:
           [ { line_id: 100,
               amount: 9,
               tax_amount: 1,
               return_authorized: false } ],
          discount_type: 'PERCENTAGE'
        }

       let headerObj = {
            'action': "refund_items",
            'brand_id': Obj.brand_data.id,
            'performed_at': now
        }
        let message = new Buffer(JSON.stringify(modJSON)).toString("base64");
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.refundItems(data, 10, data.items.eyewear.items[0].id ,now );
        let args_status = stub.calledWithExactly(message,headerObj)
        expect(args_status).to.equal(true);
        stub.reset();
    });
})
describe('ERPIntegration Testing : recieveHtk',() =>{
    it('Send Message should be called with exactly 2 arguments (base64 encoded message Body and Headers Object)', () => {
        let data:any = testData.erpData[9];
        const now = new Date()
        let erp = new ERPIntegration(Obj)
        let modJSON = {
            order_id: 2728,
            items:
           [ { line_id: 90002551,
               product_id: 'vhgftyjj',
               is_restock: 'true',
               location_id: 'htk_in' } ]
           }


       let headerObj = {
            'action': "receive_htk",
            'brand_id': Obj.brand_data.id,
            'performed_at': now
        }
        let restock = { '90002551': { restock: 'true' } }
        let message = new Buffer(JSON.stringify(modJSON)).toString("base64");
        let stub = sinon.stub(erp.sqsWrapperInstance,"pushToQueue");
        erp.receiveHtk(data,restock,now );
        let args_status = stub.calledWithExactly(message,headerObj)
        expect(args_status).to.equal(true);
        stub.reset();
    });
})
