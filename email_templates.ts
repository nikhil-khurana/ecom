import * as _ from 'underscore';
import * as express from 'express';
import { Logger, LoggerFactory, RestController } from './../common';
import { DataWrapperModel } from "./../PolyGloat";
import * as dbConstants from './../../config/db_constants';
import { CodeConstants } from '../interfaces/code_constants';
import { ErrorConstants } from '../interfaces/error_constants';
import { configService } from './../common/configLoader';

class EmailTemplates extends RestController {
    protected static readonly LOGGER: Logger = LoggerFactory.getLogger();
    constructor() {
        super();
    }
    // omit the field which we don't have to pass in response
    public static templateToApi = (template: any)=> {
        if(template['name'].startsWith("common/")) {
            template['name'] = template['name'].split("common/")[1];
            template = _.omit(template, 'from_name', 'subject', 'html', 'from_email', 'text');
        } else {
            template = _.omit(template, 'content');
        }
        return template;
    }

    // Find All Email Templates
    async findEmailTemplates(req, res, next) {
        try {
            let selectParams = [];
            let order = '';
            let limit = 0;
            let offSet = 0;
            let brandData:any = configService.getConfig().brand_data;
            let brandId = brandData.id;
            let query = { name: { $notLike: 'common/' + '%' }, brand_id: brandId };
            let dwModel = new DataWrapperModel(CodeConstants.EMAIL_TEMPLATE_TABLE, CodeConstants.EMAIL_TEMPLATE_TABLE);
            let templates = await dwModel.find(query, selectParams, order, limit, offSet);
            if (templates) {
                let response = [];
                for(let template of templates) {
                    response.push(EmailTemplates.templateToApi(template));
                }
                return super.respond(res, response);
            } else {
                return super.respondNoContent(res);
            }
        } catch (e) {
            return super.respondWithErrorMessage(res, e.message);
        }
    }

    // Find Particular One Email Template
    async findEmailTemplate(req, res, next) {
        try {
            let name = req.params.name;
            let brandData:any = configService.getConfig().brand_data;
            let brandId = brandData.id;
            let dwModel = new DataWrapperModel(CodeConstants.EMAIL_TEMPLATE_TABLE, CodeConstants.EMAIL_TEMPLATE_TABLE);
            let result = await dwModel.findOne({ name: name, brand_id: brandId });
            if (result) {
                let response = EmailTemplates.templateToApi(result);
                return super.respond(res, response);
            } else {
                return super.respondNoContent(res);
            }
        } catch (e) {
            return super.respondWithErrorMessage(res, e.message);
        }
    }

    // Create Email Template
    async createEmailTemplate(req, res, next) {
        try {
            let brandData:any = configService.getConfig().brand_data;
            let brandId = brandData.id;
            req.body.brand_id = brandId;
            let name = req.body.name;
            let dwModel = new DataWrapperModel(CodeConstants.EMAIL_TEMPLATE_TABLE, CodeConstants.EMAIL_TEMPLATE_TABLE);
            let response: any = await dwModel.findOne({ name: name, brand_id: brandId })
            if (Object.keys(response).length > 0) {
                super.respondWithErrorMessage(res, ErrorConstants.TEMPLATE + name + ErrorConstants.ALREADY_EXIST);
            } else {
                let result = await dwModel.create(req.body);
                if (result) {
                    let response = EmailTemplates.templateToApi(result);
                    return super.respond(res, response);
                } else {
                    return super.respondNoContent(res);
                }
            }
        } catch (e) {
            return super.respondWithErrorMessage(res, e.message);
        }
    }

    // Update Particular Email Template
    async updateEmailTemplate(req, res, next) {
        try {
            let whereObject = req.params;
            let updateFieldObject = req.body;
            let brandData:any = configService.getConfig().brand_data;
            let brandId = brandData.id;
            let dwModel = new DataWrapperModel(CodeConstants.EMAIL_TEMPLATE_TABLE, CodeConstants.EMAIL_TEMPLATE_TABLE);
            let responseName = await dwModel.findOne({ name: req.body.name, brand_id: brandId });
            if (responseName.name == req.body.name) {
                super.respondWithErrorMessage(res, ErrorConstants.TEMPLATE + responseName.name + ErrorConstants.ALREADY_EXIST);
            } else {
                let paramsResponse = await dwModel.findOne(whereObject);
                let result = await dwModel.update({id: paramsResponse.id}, updateFieldObject);
                if (result) {
                    let emailTemplateResponse = EmailTemplates.templateToApi(result);
                    return super.respond(res, emailTemplateResponse);
                } else {
                    return super.respondNoContent(res);
                }
            }
            return super.respondNoContent(res);
        } catch (e) {
            return super.respondWithErrorMessage(res, e.message);
        }
    }

    // Create Common Email Template
    async createCommonEmailTemplate(req, res, next) {
        try {
            let name = req.body.name;
            let brandData:any = configService.getConfig().brand_data;
            let brandId = brandData.id;
            req.body.brand_id = brandId;
            req.body.name = "common/" + req.body.name;
            let dwModel = new DataWrapperModel(CodeConstants.EMAIL_TEMPLATE_TABLE, CodeConstants.EMAIL_TEMPLATE_TABLE);
            let response: any = await dwModel.findOne({ name: name, brand_id: brandId })
            if (Object.keys(response).length > 0) {
                super.respondWithErrorMessage(res, ErrorConstants.TEMPLATE + name.split("common/")[1] + ErrorConstants.ALREADY_EXIST);
            } else {
                let result = await dwModel.create(req.body);
                if (result) {
                    let response = EmailTemplates.templateToApi(result);
                    return super.respond(res, response);
                } else {
                    return super.respondNoContent(res);
                }
            }
        } catch (e) {
            return super.respondWithErrorMessage(res, e.message);
        }
    }

    // Find All Common Email Templates
    async findCommonEmailTemplates(req, res, next) {
        try {
            let selectParams = [];
            let order = '';
            let limit = 0;
            let offSet = 0;
            let brandData:any = configService.getConfig().brand_data;
            let brandId = brandData.id;
            let query =  { name: { $like: 'common/' + '%' }, brand_id: brandId}
            let dwModel = new DataWrapperModel(CodeConstants.EMAIL_TEMPLATE_TABLE, CodeConstants.EMAIL_TEMPLATE_TABLE);
            let templates = await dwModel.find(query, selectParams, order, limit, offSet);
            if (templates) {
                let response = [];
                for(let template of templates){
                    response.push(EmailTemplates.templateToApi(template));
                }
                return super.respond(res, response);
            } else {
                return super.respondNoContent(res);
            }
        } catch (e) {
            return super.respondWithErrorMessage(res, e.message);
        }
    }

    // Find Particular Common Email Template
    async findCommonEmailTemplate(req, res, next) {
        try {
            let name = 'common/' + req.params.name;
            let brandData:any = configService.getConfig().brand_data;
            let brandId = brandData.id;
            let dwModel = new DataWrapperModel(CodeConstants.EMAIL_TEMPLATE_TABLE, CodeConstants.EMAIL_TEMPLATE_TABLE);
            let result = await dwModel.findOne({ name: name, brand_id: brandId });
            if (result) {
                let response = EmailTemplates.templateToApi(result);
                return super.respond(res, response);
            } else {
                return super.respondNoContent(res);
            }
        } catch (e) {
            return super.respondWithErrorMessage(res, e.message);
        }
    }

    // Update Particular Common Email Template
    async updateCommonEmailTemplate(req, res, next) {
        try {
            req.params.name = 'common/' + req.params.name;
            req.body.name = 'common/' + req.body.name;
            let updateFieldObject = req.body;
            let brandData:any = configService.getConfig().brand_data;
            let brandId = brandData.id;
            req.body.brand_id = brandId;
            let dwModel = new DataWrapperModel(CodeConstants.EMAIL_TEMPLATE_TABLE, CodeConstants.EMAIL_TEMPLATE_TABLE);
            let responseName = await dwModel.findOne({ name: req.body.name, brand_id: brandId });
            if (responseName.name == req.body.name) {
                super.respondWithErrorMessage(res, ErrorConstants.TEMPLATE + responseName.name.split("common/")[1] + ErrorConstants.ALREADY_EXIST);
            } else {
                let paramsResponse = await dwModel.findOne(req.params);
                let result  = await dwModel.update({ id: paramsResponse.id }, updateFieldObject);
                if (result) {
                    let response = EmailTemplates.templateToApi(result);
                    return super.respond(res, response);
                } else {
                    return super.respondNoContent(res);
                }
            }
            return super.respondNoContent(res);
        } catch (e) {
            return super.respondWithErrorMessage(res, e.message);
        }
    }
}

export { EmailTemplates as EmailTemplatesController };
