import lexical_analysis
from json import dumps

print(
    dumps(
        lexical_analysis.lexical_analysis(
            '''
            log(5*3)
            '''
        ),
        indent=4
    )
)
