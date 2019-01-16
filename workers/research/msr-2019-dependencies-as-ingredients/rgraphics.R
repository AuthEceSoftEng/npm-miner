deps = read.csv(file="output-top-Deps.csv")
a <-paste(round((deps$value/5009)[1:10]*100, digits=0), "%", sep="")
setEPS()
postscript("topDeps.eps")
p <- barplot(deps$value[1:10], names.arg = deps$name[1:10], las=2, ylim=c(0,600))
text(p, deps$value[1:10] + 20, labels=a, xpd=TRUE)
dev.off()


data <- read.csv(sep=";", file="output-pmiStatsPerPackage.csv", header=F)