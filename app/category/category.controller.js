import { catchresponse, sendResponse } from '../../shared/commonFunction';

import Classschema from './schema/category.schema';
import subcatschema from './schema/subcategory.schema';
export const getCategory = async (req, res) => {
    try {
        const data = await categoryschema.find();
        sendResponse(res, 200, true, 'success', data);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const getClass = async (req, res) => {
    try {
        const data = await Classschema.find();
        sendResponse(res, 200, true, 'success', data);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const addClass = async (req, res) => {
    try {
        const { name } = req.body;

        const payload = {
            name: name,
        };

        const exist = await Classschema.findOne(payload);

        if (exist) {
            return sendResponse(res, 209, false, 'category already exist');
        }
        const data = await Classschema.create(payload);
        sendResponse(
            res,
            200,
            data ? true : false,
            data ? 'created successfully' : 'failed to create',
            data,
        );
    } catch (error) {
        catchresponse(res, error);
    }
};

export const changeClassstatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        const data = await Classschema.findOneAndUpdate({ _id: id }, { isActive: !status });
        sendResponse(res, 200, true, 'status changed', data);
    } catch (error) {
        catchresponse(res, error);
    }
};

//   export const addSubCategory = async (req,res)=>{
//     try{
//       const {name } = req.body

// const payload = {
//   name : name

// }

// const exist = await subcatschema.findOne(payload)

// if(exist){
//   return sendResponse(res , 209 , false , "category already exist" )
// }
// const data = await subcatschema.create(payload)
// sendResponse(res , 200 , data ? true : false , data? "created successfully" : "failed to create" , data)

// }catch(error){
//   catchresponse(res , error)
// }

//   }

export const addSubCategory = async (req, res) => {
    try {
        const { _id, subname } = req.body;

        // const find = {
        //   key : subname ,
        //   Classid : _id,
        //   value : []
        // }
        const subdata = await Classschema.findById(_id);
        const find = {
            key: subname,
            Classid: _id,
            category: subdata.name,
            value: [],
        };
        // element match
        const exist = await subcatschema.findOne({ Classid: _id, key: subname });

        if (exist) {
            return sendResponse(res, 209, false, 'subcategory already exist');
        }
        const data = await subcatschema.create(find);

        // const data = await categoryschema.findOneAndUpdate(find , { $push: { subcategory: subname } }, { new: true })
        sendResponse(
            res,
            200,
            data ? true : false,
            data ? 'subcategory added' : 'failed to add ',
            data,
        );
    } catch (error) {
        catchresponse(res, error);
    }
};

export const chnagestatusSubCategory = async (req, res) => {
    try {
        const { name, status } = req.body;
        const data = await categoryschema.findOneAndUpdate({ name: name }, { isActive: !status });

        sendResponse(res, 200, true, 'status changed', data);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const subcategorylist = async (req, res) => {
    try {
        const { id } = req.body;
        const data = await subcatschema.find({ Classid: id });
        sendResponse(res, 200, true, 'success', data);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const subcategoryvaluelist = async (req, res) => {
    try {
        const { id } = req.body;
        const data = await subcatschema.findOne({ _id: id });
        sendResponse(res, 200, true, 'success', data);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const addsubcategoryvalue = async (req, res) => {
    try {
        const { _id, value } = req.body;
        const data = await subcatschema.findOne({ _id: _id });
        const len = data?.value?.length ? data.value.length : 0;
        const payload = {
            index: len,
            value: value,
        };
        const newarr = data?.value ? data?.value : [];
        newarr.push(payload);
        const updatedata = await subcatschema.findByIdAndUpdate(_id, { $push: { value: payload } });
        // const updatedata = await subcatschema.findByIdAndUpdate(id ,   {$set:{ value : newarr}}  )

        sendResponse(
            res,
            200,
            updatedata ? true : false,
            updatedata ? 'success' : 'failed',
            updatedata,
        );
    } catch (error) {
        catchresponse(res, error);
    }
};

export const categorylist = async (req, res) => {
    try {
        const payload = {
            class: await Classschema.find(),
            subcategorylist: await subcatschema.find(),
        };
        res.status(200).json({ status: true, message: 'success', data: payload });
        // sendResponse(res , 200  , true  , "success", payload)
    } catch (error) {
        catchresponse(res, error);
    }
};
