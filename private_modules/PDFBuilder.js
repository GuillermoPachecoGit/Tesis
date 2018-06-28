




class PDFBuilder {
    constructor() {
        
     }

     arrayToString(table,header){
        var string_table = [header];
        for (let index = 0; index < table.length; index++) {
            const element = table[index];
            string_table.push(element.map(String));
        }
        return string_table;
     }


     generateTableDistance(params,header,pdf){
        var table_pdf = {
            style: 'tableExample',
            table: {
                headerRows: 1,
                body: 
                    []
                
            },
            layout: {
                hLineWidth: function (i, node) {
                    return (i === 0 || i === node.table.body.length) ? 2 : 1;
                },
                vLineWidth: function (i, node) {
                    return (i === 0 || i === node.table.widths.length) ? 2 : 1;
                },
                hLineColor: function (i, node) {
                    return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
                },
                vLineColor: function (i, node) {
                    return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
                },
                // paddingLeft: function(i, node) { return 4; },
                // paddingRight: function(i, node) { return 4; },
                // paddingTop: function(i, node) { return 2; },
                // paddingBottom: function(i, node) { return 2; },
                // fillColor: function (i, node) { return null; }
            }
        }
        table_pdf.table.body.push(header);
        for (let index = 0; index < params.data.length; index++) {
            const element = params.data[index];
            
            var table = [{text: params.specimen_name[index], bold: true }];
            var table_string = element.map(String);
            for (let index = 0; index < table_string.length; index++) {
                table.push(table_string[index]);
                
            }
            console.log(table);
            table_pdf.table.body.push(
                table
            );
        }
        pdf.content.push(table_pdf)
        console.log(JSON.stringify(table_pdf));
        return pdf;
     }

     generateTableOrdination(params,pdf){
        for (let index = 0; index < params.data.length; index++) {
            const element = params.data[index];
            var coord = element.map(String);
            pdf.content.push({text: params.specimen_name[index]+' -->  ('+coord[0]+','+coord[1]+')', bold:true});
        }
        return pdf;
     }

     generateTable(params,header,dd){
        for (let index = 0; index < params.data.length; index++) {
            const element = params.data[index];
            var table = this.arrayToString(element['specimen'+index],header);
            dd.content.push({text: params.specimen_name[index]});
            dd.content.push(
                {
                    style: 'tableExample',
                    table: {
                        headerRows: 1,
                        body: 
                            table
                        
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 2 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 2 : 1;
                        },
                        hLineColor: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
                        },
                        vLineColor: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
                        },
                        // paddingLeft: function(i, node) { return 4; },
                        // paddingRight: function(i, node) { return 4; },
                        // paddingTop: function(i, node) { return 2; },
                        // paddingBottom: function(i, node) { return 2; },
                        // fillColor: function (i, node) { return null; }
                    }
                }
            );
        }
        return dd;
    }
     
     generatePDF_Dataset(params){
        var header = [];
        if(params.dimention === 3){
            header.push('X','Y','Z');
        }else{
            header.push('X','Y');
        }

        
       
        var pdf = {
            content: [
                
                {text: 'Procrustes analysis report', style: 'header'},


                {text: 'Algorithm used: '+params.algorithm},
                {text: 'Dimension: '+params.dimention+'D'},
                {text: 'Name: '+params.name},
                {text: 'Source dataset: '+params.original_name},
                {text: 'Numbers of specimens: '+params.numbers_of_specimen },  
                {text: 'Numbers of landmarks: '+params.numbers_of_landmark }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 10, 0, 5]
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 13,
                    color: 'black'
                }
            },
            defaultStyle: {
                // alignment: 'justify'
            },
            pageSize: 'A4'
        }

        
        if(params.excluded_land.length > 0){
            pdf.content.push({text: 'Excluded landmark: '});
            for (let index = 0; index < params.excluded_land.length; index++) {
                const element = params.excluded_land[index];
                pdf.content.push({text: 'LM_'+(parseInt(element)+1)});
            }
        }else{
            pdf.content.push({text: 'Excluded landmark: N/A'});
        }
        
        if(params.excluded_spec.length > 0){
            pdf.content.push({text: 'Excluded Specimen: '});
            for (let index = 0; index < params.excluded_spec.length; index++) {
                const element = params.excluded_spec[index];
                pdf.content.push({text: params.specimen_name[element]});
            }
        }else{
            pdf.content.push({text: 'Excluded Specimen: N/A'});
        }
        

        pdf.content.push({text: 'Specimens: ', style: 'header'});


        return this.generateTable(params,header,pdf);
     }

     generatePDF_Distance(params){

        var header = [];
        header.push({ text: ' ', bold: true });
        for (let index = 0; index < params.specimen_name.length; index++) {
            const element = params.specimen_name[index]; 
            header.push({ text: element, bold: true });       
        }

        var pdf = {
            content: [
                
                {text: 'Procrustes multivariate distance report', style: 'header'},


                {text: 'Algorithm used: '+params.algorithm},
                {text: 'Name: '+params.name},
                {text: 'Source dataset: '+params.original_name},
                {text: 'Numbers of specimens: '+params.numbers_of_specimen }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 10, 0, 5]
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 13,
                    color: 'black'
                }
            },
            defaultStyle: {
                // alignment: 'justify'
                fontSize: 11
            },
            pageSize: 'A4'
        }

        return this.generateTableDistance(params,header,pdf);
     }

     generatePDF_Ordination(params){

        var pdf = {
            content: [
                
                {text: 'Universal multidimensional scaling report', style: 'header'},


                {text: 'Algorithm used: '+params.algorithm},
                {text: 'Name: '+params.name},
                {text: 'Source distance: '+params.distance_name},
                {text: 'Coordinates', style: 'subheader'}
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 10, 0, 5]
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 13,
                    color: 'black'
                }
            },
            defaultStyle: {
                // alignment: 'justify'
            },
            pageSize: 'A4'
        }

        return this.generateTableOrdination(params,pdf);
     }
        

}
  
module.exports = PDFBuilder;