const productModel=require('../models/products-model')



exports.getProductByID=async (req,res)=>{
   try {
    const id=req.params.id
    const product= await productModel.findById(id)

    if(!product){
       return res.status(404).json({
        success:false,
        message:"product not found"
       })
    }
     res.status(200).json({product})
   } catch (error) {
    console.log(error);
    
   }
}


exports.getAllProduct = async (req, res) => {
    try {
        const {company,name,featured,sort,select} = req.query;

        const queryObject = {};

        // Filter by company
        if (company) {
            queryObject.company = company;
        }

        // Search by name
        if (name) {
            queryObject.name = {
                $regex: name,
                $options: "i"
            };
        }

        // Filter by featured
        if (featured !== undefined) {
            queryObject.featured = featured;
        }

        let productData = productModel.find(queryObject);

        // Select fields
        if (select) {
            const fixSelect = select.split(",").join(" ");
            productData = productData.select(fixSelect);
        }

        // Sort
        if (sort) {
            const fixSort = sort.split(",").join(" ");
            productData = productData
             .collation({
            locale: "en",
            strength: 2
        })
            .sort(fixSort);
        }

        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        productData = productData
            .skip(skip)
            .limit(limit);

        const products = await productData;

        res.status(200).json({
            success: true,
            nbHits: products.length,
            products
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};





exports.getTesting=async(req,res)=>{
     try {
    const products= await productModel.find({company:'samsung'})
    if(!products){
       return res.status(404).json({message:'no products found'})
    }
     res.status(200).json({products,
        sucess:true
     })
   } catch (error) {
    console.log(error);
     res.status(500).json({
            success: false,
            message: "Server error"
        });
   }
}