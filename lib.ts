    import * as _ from 'underscore';
    import * as mime from 'mime';
    import * as base64Regex from 'base64-regex';
    import { Sequelize } from 'sequelize';
    import { LibHelper, S3Helper } from  './../../PolyGloat';
    import { schemaClient } from "./schemas/index";
    import * as lib_constant from '../lib_constant';


    class DataWrapper {

        private mysqlSchema : any;
        private libHelperObj : any;

        constructor (collection:string, mysqlSchema:string) {
            schemaClient.readSchemas();
            let models =   schemaClient.getModels();
            this.mysqlSchema = models[mysqlSchema];
            this.libHelperObj = new LibHelper(collection, mysqlSchema);
        }

        public find(condition: any,  selectParams: any[], order:any, limit:any, offset: any) {
            try {
                return this.libHelperObj.findAndCountAll(condition, selectParams, order, limit, offset);
            } catch(e) {
                throw e;
            }
        }

        public findOne(condition: any) {
            try {
                return this.libHelperObj.findOne(condition);
            } catch(e) {
                throw e;
            }
        }

        public async create(data: any) {
            let schemaKeysArr = _.keys(this.mysqlSchema.attributes);
            var __this = this;
            var _key = null;
            var isBase64String = null;
            var s3_data = {};
            for (var index in data) {
                if(typeof data[index] == 'object' && _.some(data[index], function(obj, key:string){ return key == lib_constant.FILE_CONTENT_TYPE;})){
                    _key = index;
                    break;
                } else if (base64Regex({exact: true}).test(data[index])){
                    isBase64String = index;
                    break;
                }
            };
            try{
                if(data[lib_constant.FILE_CONTENT_TYPE] != undefined){
                    var result: any =  await __this.uploadToS3(data[lib_constant.FILE_NAME], data[lib_constant.FILE_DATA], null);
                }else  if(isBase64String){
                    var result: any =  await __this.uploadToS3(Math.random().toString(36).substring(7),  data[isBase64String], null);
                    delete data[isBase64String];
                }else if(_key){
                    var result: any =  await __this.uploadToS3(data[_key][lib_constant.FILE_NAME], data[_key][lib_constant.FILE_DATA], null);
                    delete data[_key];
                }

                //checking the status in result
                if(result && result['success'] == true){
                    delete data[_key];
                    if (result && Object.keys(result).length && result.data) {
                        let name = (result.data.key).split(".")
                        s3_data[lib_constant.FILE_TABLE_COLUMN_1] = result.data.key;
                        s3_data[lib_constant.FILE_TABLE_COLUMN_2] = name[1];
                        s3_data[lib_constant.FILE_TABLE_COLUMN_3] = result.data.Location;
                        s3_data[lib_constant.FILE_TABLE_COLUMN_4] = data[lib_constant.FILE_TABLE_COLUMN_4];
                        var libHelperObj = new LibHelper(lib_constant.FILE_TABLE_NAME, lib_constant.FILE_TABLE_NAME);
                        var res = await libHelperObj.create(s3_data, []);
                        if(res && res.id){

                            data[lib_constant.FILE_TABLE_COLUMN_5] = res.id;
                            delete data[lib_constant.FILE_TABLE_COLUMN_4];
                        }

                    }
                }else if(data[lib_constant.FILE_CONTENT_TYPE] || isBase64String || _key){
                    throw  "Error in file uploading to S3";
                }

            }catch(e){
                throw e.message;
            }

            try{
                let mysqlObj = _.pick(data, schemaKeysArr);
                let mongoObj = _.omit(data, schemaKeysArr);
                 var result: any =  await this.libHelperObj.create(mysqlObj, mongoObj);
                 if (s3_data && Object.keys(s3_data).length ) {
                     result['rx_file'] = s3_data;
                 }
                 return result;
            }catch(e){
                throw e;
            }
        }

        public async update(condition: any, data: any) {
            let schemaKeysArr = _.keys(this.mysqlSchema.attributes);
            var __this = this;
            var _key = null;
            var isBase64String = null;
            var s3_data = {};
            for (var index in data) {
                if(typeof data[index] == 'object' && _.some(data[index], function(obj, key:string){ return key == lib_constant.FILE_CONTENT_TYPE;})){
                    _key = index;
                    break;
                }else if (base64Regex({exact: true}).test(data[index])){
                    isBase64String = index;
                    break;
                }
            };
            try{
                if(data[lib_constant.FILE_CONTENT_TYPE] != undefined){
                    var result: any =  await __this.uploadToS3(data[lib_constant.FILE_NAME], data[lib_constant.FILE_DATA], null);
                }else if(isBase64String){
                    var result: any =  await __this.uploadToS3(Math.random().toString(36).substring(7),  data[isBase64String], null);
                    delete data[isBase64String];
                }else if(_key){
                    var result: any =  await __this.uploadToS3(data[_key][lib_constant.FILE_NAME], data[_key][lib_constant.FILE_DATA], null);
                    delete data[_key];
                }

                //checking the status in result
                if(result && result['success'] == true){
                    delete data[_key];
                    if (result && Object.keys(result).length && result.data) {
                        let name = (result.data.key).split(".")
                        s3_data[lib_constant.FILE_TABLE_COLUMN_1] = result.data.key;
                        s3_data[lib_constant.FILE_TABLE_COLUMN_2] = name[1];
                        s3_data[lib_constant.FILE_TABLE_COLUMN_3] = result.data.Location;
                        s3_data[lib_constant.FILE_TABLE_COLUMN_4] = data[lib_constant.FILE_TABLE_COLUMN_4];
                        var libHelperObj = new LibHelper(lib_constant.FILE_TABLE_NAME, lib_constant.FILE_TABLE_NAME);
                        var res = await libHelperObj.create(s3_data, []);
                        if(res && res.id){
                            data[lib_constant.FILE_TABLE_COLUMN_5] = res.id;
                            delete data[lib_constant.FILE_TABLE_COLUMN_4];
                        }
                    }else if(data[lib_constant.FILE_CONTENT_TYPE] || isBase64String || _key){
                        throw  "Error in file uploading to S3";
                    }
                }
            }catch(e){
                throw e.message;
            }

            try{
                let mysqlObj = _.pick(data, schemaKeysArr);
                let mongoObj = _.omit(data, schemaKeysArr);
                var result: any =  await this.libHelperObj.update(condition, mysqlObj, mongoObj);
                if (s3_data && Object.keys(s3_data).length ) {
                    console.log("=======",s3_data, result );
                    result['rx_file'] = s3_data;
                }
                return result;
            }catch(e){
                throw e;
            }
        }

        public destroy(condition: any) {
            try {
                return this.libHelperObj.destroy(condition);
            } catch(e) {
                throw e;
            }
        }

        public pushAndUpdate(condition: any, data: any) {
            let schemaKeysArr = _.keys(this.mysqlSchema.attributes);
            let mysqlObj = _.pick(data, schemaKeysArr);
            let mongoObj = _.omit(data, schemaKeysArr);
            try {
                return this.libHelperObj.pushAndUpdate(condition, mysqlObj, mongoObj);
            }catch(e){
                throw e;
            }
        }

        public pullAndUpdate(condition: any, data: any) {
            let schemaKeysArr = _.keys(this.mysqlSchema.attributes);
            let mysqlObj = _.pick(data, schemaKeysArr);
            let mongoObj = _.omit(data, schemaKeysArr);

            for (var key in mysqlObj){
                mysqlObj[key] = null;
            }
            try {
                return this.libHelperObj.pullAndUpdate(condition, mysqlObj, mongoObj);
            }catch(e){
                throw e;
            }
        }


        public bulkCreate(data: any) {
            let schemaKeysArr = _.keys(this.mysqlSchema.attributes);
            let mysqlObj = _.pick(data, schemaKeysArr);
            let mongoObj = _.omit(data, schemaKeysArr);
            mongoObj = _.toArray(data);
            try {
                return this.libHelperObj.bulkCreate(mysqlObj, mongoObj);
            } catch(e) {
                throw e;
            }
        }

        public customQuery(query: string, db:any) {
            try {
                return this.libHelperObj.customQuery(query, db);
            } catch(e) {
                throw e;
            }
        }

        // upload data to s3_details
        public async uploadToS3 (filename, file_data, constants) {
            let s3Obj = new S3Helper(lib_constant.ACCESS_KEY_ID, lib_constant.SECRET_ACCESS_KEY, lib_constant.AWS_S3_REGION, lib_constant.BUCKET_NAME);
            try {
                let result = await s3Obj.uploadObject(filename, new Buffer(file_data, "base64"));
                if(result && Object.keys(result).length){
                    return result;
                }
            } catch(e) {
              console.log("\r\n\n\n e ", e);
                throw e;
            }
        }
    }

    export {DataWrapper as DataWrapperModel};