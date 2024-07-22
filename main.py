import lexical_analysis
import semantic_analysis
from json import dumps

lexical_analyzed, err = lexical_analysis.lexical_analysis_expression('1 / 4 + 1', 1)
if not err:
    print(dumps(lexical_analyzed))
    semantic_analyzed, err2 = semantic_analysis.semantic_analysis_expression(lexical_analyzed, 1)
    print(semantic_analyzed)
    if not err2:
        print(semantic_analyzed)
