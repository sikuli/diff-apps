var ResultViewer = React.createClass({

    componentDidMount: function() {
    },

    getInitialState: function() {        
        return {
            results: []
        }
    },    

    render: function() {
        var style = {
            height: '100%',
            background: 'rgba(240,240,240,0.15)'
        }

        var resultNodes = this.state.results.map(function(result,index){

            return (
                <div className="row" key={index}>
                    <div className="col-md-8">
                        {result.app}-
                        {result.version}
                    </div>                    
                    <div className="col-md-4">
                        <a href={'/view/xml/'+ result.app + '/' + result.version} target="xml">xml</a>
                    </div>
                </div>
            )

        })

    return (<div className="resultList">
                {resultNodes}
           </div>)
    }
})